import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import type { World } from "@3dworld/content";
import {
  AskPayload,
  type ChatAuthor,
  type ChatMessage,
  ChatSendPayload,
  type ClientToServerEvents,
  EmotePayload,
  type ErrorCode,
  JoinRoomPayload,
  PoseUpdate,
  type ServerToClientEvents,
} from "@3dworld/contracts";
import { Server } from "socket.io";
import type { SessionStore } from "../auth/sessions.ts";
import { answerFromContent } from "../brain/answer.ts";
import type { Config } from "../config.ts";
import { createRateLimiter } from "../rateLimit.ts";
import { createRooms, type MemberInfo } from "./rooms.ts";

type SocketData = { user: MemberInfo };

const failure = (error: ErrorCode, message?: string) =>
  message ? { ok: false as const, error, message } : { ok: false as const, error };

export const attachRealtime = (deps: {
  httpServer: HttpServer;
  config: Config;
  world: World;
  sessions: SessionStore;
}) => {
  const { config, world, sessions } = deps;
  const rooms = createRooms({ world, capacity: config.roomCapacity });
  const chatLimiter = createRateLimiter({ limit: 5, windowMs: 10_000 });
  const askLimiter = createRateLimiter({ limit: 6, windowMs: 60_000 });
  const timers = new Set<NodeJS.Timeout>();

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(deps.httpServer, {
    cors: { origin: config.corsOrigins },
    serveClient: false,
    maxHttpBufferSize: 16 * 1024,
  });

  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth as { token?: unknown } | undefined)?.token;
      const user = await sessions.resolve(token);
      if (!user) return next(new Error("unauthorized"));
      socket.data.user = { id: user.id, name: user.name, avatarId: user.avatarId, kind: user.kind };
      void sessions.touch(user.id).catch(() => {});
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("auth failed"));
    }
  });

  const message = (
    roomId: string,
    from: ChatAuthor,
    text: string,
    extra: Partial<ChatMessage> = {},
  ) => {
    const m: ChatMessage = {
      id: randomUUID(),
      roomId,
      from,
      text,
      at: new Date().toISOString(),
      ...extra,
    };
    rooms.addChat(roomId, m);
    io.to(roomId).emit("chat:message", m);
    return m;
  };

  io.on("connection", (socket) => {
    const me = socket.data.user;
    const report = (event: string, err: unknown) =>
      console.error(
        `[socket] ${event} from ${me.id} failed:`,
        err instanceof Error ? err.message : err,
      );
    const ackOf = (maybe: unknown) =>
      typeof maybe === "function" ? (maybe as (res: unknown) => void) : () => {};

    const leaveCurrent = () => {
      const roomId = rooms.leave(me.id);
      if (roomId) {
        void socket.leave(roomId);
        socket.to(roomId).emit("presence:leave", { id: me.id });
      }
    };

    socket.on("room:join", (payload, ack) => {
      const reply = ackOf(ack);
      try {
        const parsed = JoinRoomPayload.safeParse(payload);
        if (!parsed.success) return reply(failure("bad_request"));
        const joined = rooms.join(parsed.data.districtId, me, socket.id);
        if (!joined.ok) return reply(failure(joined.error));
        if (joined.replacedSocket) {
          const old = io.sockets.sockets.get(joined.replacedSocket);
          old?.emit("notice", { level: "warn", text: "You joined from another tab or device." });
          old?.disconnect(true);
        }
        if (joined.left) {
          void socket.leave(joined.left);
          socket.to(joined.left).emit("presence:leave", { id: me.id });
        }
        const room = joined.room;
        void socket.join(room.roomId);
        socket.to(room.roomId).emit("presence:join", room.self);
        reply({ ok: true, room });
      } catch (err) {
        report("room:join", err);
        reply(failure("internal_error"));
      }
    });

    socket.on("room:leave", () => leaveCurrent());

    socket.on("pose", (payload) => {
      const parsed = PoseUpdate.safeParse(payload);
      if (!parsed.success) return;
      const result = rooms.setPose(me.id, parsed.data);
      if (result?.corrected) socket.emit("pose:correct", result.pose);
    });

    socket.on("chat:send", (payload, ack) => {
      const reply = ackOf(ack);
      const parsed = ChatSendPayload.safeParse(payload);
      if (!parsed.success) return reply(failure("bad_request"));
      const room = rooms.roomOf(me.id);
      if (!room) return reply(failure("forbidden", "join a room first"));
      if (!chatLimiter.take(me.id)) return reply(failure("rate_limited"));
      const m = message(room.id, { kind: "player", id: me.id, name: me.name }, parsed.data.text);
      reply({ ok: true, message: m });
    });

    socket.on("emote", (payload) => {
      const parsed = EmotePayload.safeParse(payload);
      const room = rooms.roomOf(me.id);
      if (!parsed.success || !room) return;
      io.to(room.id).emit("emote", { id: me.id, emote: parsed.data.emote });
    });

    socket.on("resident:ask", (payload, ack) => {
      const reply = ackOf(ack);
      try {
        const parsed = AskPayload.safeParse(payload);
        if (!parsed.success) return reply(failure("bad_request"));
        const room = rooms.roomOf(me.id);
        if (!room) return reply(failure("forbidden", "join a room first"));
        const resident = world.residents.get(parsed.data.residentId);
        const home = resident ? world.places.get(resident.homePlaceId) : undefined;
        if (!resident || home?.districtId !== room.districtId) {
          return reply(failure("not_found", "that resident isn't here"));
        }
        if (!askLimiter.take(me.id)) return reply(failure("rate_limited"));

        const answer = answerFromContent(world, resident.id, parsed.data.question);
        if (!answer) return reply(failure("not_found"));
        message(room.id, { kind: "player", id: me.id, name: me.name }, parsed.data.question, {
          to: { id: resident.id, name: resident.name },
        });
        io.to(room.id).emit("resident:thinking", { residentId: resident.id, forId: me.id });
        const timer = setTimeout(() => {
          timers.delete(timer);
          const m = message(
            room.id,
            { kind: "resident", id: resident.id, name: resident.name },
            answer.text,
            {
              to: { id: me.id, name: me.name },
              channel: answer.channel,
            },
          );
          reply({
            ok: true,
            answer: {
              residentId: resident.id,
              text: answer.text,
              channel: answer.channel,
              at: m.at,
            },
          });
        }, config.residentReplyDelayMs);
        timers.add(timer);
      } catch (err) {
        report("resident:ask", err);
        reply(failure("internal_error"));
      }
    });

    socket.on("disconnect", () => {
      // Only leave if this socket still owns the membership (a newer tab may have taken over).
      if (rooms.member(me.id)?.socketId === socket.id) leaveCurrent();
    });
  });

  const tick = setInterval(() => {
    for (const { roomId, batch } of rooms.flushPoses()) io.to(roomId).volatile.emit("poses", batch);
  }, 1000 / 10);
  const sweep = setInterval(() => {
    chatLimiter.sweep();
    askLimiter.sweep();
  }, 60_000);
  sweep.unref();

  return {
    io,
    rooms,
    close: async () => {
      clearInterval(tick);
      clearInterval(sweep);
      for (const t of timers) clearTimeout(t);
      timers.clear();
      await io.close();
    },
  };
};
