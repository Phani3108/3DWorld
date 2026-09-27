import type {
  ChatMessage,
  ClientToServerEvents,
  Emote,
  Pose,
  ResidentAnswer,
  Result,
  RoomSnapshot,
  ServerToClientEvents,
} from "@3dworld/contracts";
import { io, type Socket } from "socket.io-client";
import {
  chatAtom,
  connectionAtom,
  narrate,
  playersAtom,
  poses,
  roomIdAtom,
  selfPose,
  setPose,
  store,
  thinkingAtom,
} from "../state/store.ts";
import { API_URL } from "./api.ts";

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ClientSocket | null = null;
let seq = 0;
let selfId: string | null = null;

const pushChat = (m: ChatMessage) =>
  store.set(chatAtom, (list) =>
    list.some((x) => x.id === m.id) ? list : [...list, m].slice(-200),
  );

const applySnapshot = (room: RoomSnapshot) => {
  poses.clear();
  store.set(roomIdAtom, room.roomId);
  store.set(playersAtom, new Map(room.players.map(({ pose: _pose, ...p }) => [p.id, p])));
  for (const p of room.players) setPose(p.id, p.pose);
  for (const r of room.residents) setPose(r.id, r.pose);
  selfPose.current = room.self.pose;
  store.set(chatAtom, room.recentChat);
  store.set(thinkingAtom, {});
};

/** Connect with a bearer token. Listeners are attached before connecting so nothing is missed. */
export const connect = (token: string, userId: string) => {
  disconnect();
  selfId = userId;
  store.set(connectionAtom, "connecting");
  const s: ClientSocket = io(API_URL, {
    auth: { token },
    autoConnect: false,
    transports: ["websocket", "polling"],
  });

  s.on("connect", () => store.set(connectionAtom, "online"));
  s.on("disconnect", () => store.set(connectionAtom, "offline"));
  s.on("connect_error", () => store.set(connectionAtom, "offline"));

  s.on("presence:join", (p) => {
    const { pose, ...meta } = p;
    store.set(playersAtom, (m) => new Map(m).set(p.id, meta));
    setPose(p.id, pose);
    narrate(`${p.name} arrived.`);
  });
  s.on("presence:leave", ({ id }) => {
    const name = store.get(playersAtom).get(id)?.name;
    store.set(playersAtom, (m) => {
      const next = new Map(m);
      next.delete(id);
      return next;
    });
    poses.delete(id);
    if (name) narrate(`${name} left.`);
  });
  s.on("poses", ({ poses: batch }) => {
    for (const { id, ...pose } of batch) if (id !== selfId) setPose(id, pose);
  });
  s.on("pose:correct", (pose) => {
    selfPose.current = pose;
  });
  s.on("chat:message", (m) => {
    pushChat(m);
    if (m.from.kind === "resident") {
      const residentId = m.from.id;
      store.set(thinkingAtom, (t) => {
        const next = { ...t };
        delete next[residentId];
        return next;
      });
      if (m.to?.id === selfId) narrate(`${m.from.name} says: ${m.text}`);
    }
  });
  s.on("resident:thinking", ({ residentId, forId }) => {
    store.set(thinkingAtom, (t) => ({ ...t, [residentId]: forId }));
  });
  s.on("notice", ({ text }) => narrate(text));

  socket = s;
  s.connect();
  return s;
};

export const disconnect = () => {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  store.set(connectionAtom, "idle");
  store.set(roomIdAtom, null);
};

const needSocket = () => {
  if (!socket) throw new Error("not connected");
  return socket;
};

export const joinDistrict = async (districtId: string): Promise<Result<{ room: RoomSnapshot }>> => {
  const s = needSocket();
  if (!s.connected) await new Promise<void>((resolve) => s.once("connect", () => resolve()));
  const res = await s.timeout(8000).emitWithAck("room:join", { districtId });
  if (res.ok) applySnapshot(res.room);
  return res;
};

export const sendPose = (pose: Pose) => {
  seq += 1;
  socket?.volatile.emit("pose", { ...pose, seq });
};

export const say = (text: string) => needSocket().timeout(8000).emitWithAck("chat:send", { text });

export const ask = (
  residentId: string,
  question: string,
): Promise<Result<{ answer: ResidentAnswer }>> =>
  needSocket().timeout(20_000).emitWithAck("resident:ask", { residentId, question });

export const emote = (name: Emote) => socket?.emit("emote", { emote: name });
