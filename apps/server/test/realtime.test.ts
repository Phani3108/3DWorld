import type { ChatMessage, RoomSnapshot } from "@3dworld/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { next, startServer, type TestClient } from "./helpers.ts";

let t: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => {
  t = await startServer();
});
afterAll(async () => {
  await t.close();
});

const join = (socket: TestClient, districtId: string) =>
  socket.emitWithAck("room:join", { districtId }) as Promise<{
    ok: boolean;
    room: RoomSnapshot;
    error?: string;
  }>;

describe("realtime", () => {
  it("refuses sockets without a valid token", async () => {
    await expect(t.connect(undefined)).rejects.toThrow(/unauthorized/);
    await expect(t.connect("3dw_s_forged")).rejects.toThrow(/unauthorized/);
  });

  it("joins a district with residents and sees other players arrive and leave", async () => {
    const a = await t.guest("Asha");
    const b = await t.guest("Bilal", "body-m-young");
    const sa = await t.connect(a.token);
    const joinedA = await join(sa, "hyd-old-city");
    expect(joinedA.ok).toBe(true);
    expect(joinedA.room.roomId).toBe("hyd-old-city#1");
    expect(joinedA.room.self).toMatchObject({ id: a.user.id, name: "Asha" });
    expect(joinedA.room.residents.map((r) => r.id)).toEqual(
      expect.arrayContaining(["farah_hyd", "zara_hyd", "asad_hyd", "naseem_hyd"]),
    );

    const arrived = next(sa, "presence:join");
    const sb = await t.connect(b.token);
    const joinedB = await join(sb, "hyd-old-city");
    expect(joinedB.room.players.map((p) => p.id)).toContain(a.user.id);
    expect((await arrived).id).toBe(b.user.id);

    const left = next(sa, "presence:leave");
    sb.disconnect();
    expect((await left).id).toBe(b.user.id);
  });

  it("rejects unknown districts and malformed payloads", async () => {
    const g = await t.guest();
    const s = await t.connect(g.token);
    expect(await join(s, "atlantis")).toMatchObject({ ok: false, error: "not_found" });
    expect(await s.emitWithAck("room:join", { districtId: 42 } as never)).toMatchObject({
      ok: false,
      error: "bad_request",
    });
    expect(await s.emitWithAck("chat:send", { text: "hi" })).toMatchObject({
      ok: false,
      error: "forbidden",
    });
  });

  it("broadcasts poses and clamps impossible moves", async () => {
    const a = await t.guest("Runner");
    const b = await t.guest("Watcher");
    const sa = await t.connect(a.token);
    const sb = await t.connect(b.token);
    const { room } = await join(sa, "dxb-deira");
    await join(sb, "dxb-deira");

    const { x, z } = room.self.pose;
    const seen = next(sb, "poses");
    sa.emit("pose", { x: x + 1, z, heading: 0, anim: "walk", seq: 1 });
    const batch = await seen;
    const mine = batch.poses.find((p) => p.id === a.user.id);
    expect(mine?.x).toBeCloseTo(x + 1, 5);

    const corrected = next(sa, "pose:correct");
    sa.emit("pose", { x: x + 400, z, heading: 0, anim: "run", seq: 2 });
    const snap = await corrected;
    expect(snap.x - x).toBeLessThan(20);
  });

  it("relays chat to the room and rate-limits floods", async () => {
    const a = await t.guest("Chatty");
    const b = await t.guest("Listener");
    const sa = await t.connect(a.token);
    const sb = await t.connect(b.token);
    await join(sa, "blr-central");
    await join(sb, "blr-central");
    const heard = next(sb, "chat:message");
    const res = await sa.emitWithAck("chat:send", { text: "  namaskara  " });
    expect(res).toMatchObject({ ok: true });
    const m = (await heard) as ChatMessage;
    expect(m).toMatchObject({
      text: "namaskara",
      from: { kind: "player", id: a.user.id, name: "Chatty" },
    });

    const results = [];
    for (let i = 0; i < 6; i++)
      results.push(await sa.emitWithAck("chat:send", { text: `msg ${i}` }));
    expect(results.some((r) => !r.ok && r.error === "rate_limited")).toBe(true);
  });

  it("lets a player ask a resident in the same district, in front of the room", async () => {
    const a = await t.guest("Curious");
    const b = await t.guest("Bystander");
    const sa = await t.connect(a.token);
    const sb = await t.connect(b.token);
    await join(sa, "hyd-old-city");
    await join(sb, "hyd-old-city");

    const heard: ChatMessage[] = [];
    sb.on("chat:message", (m) => heard.push(m));
    const thinking = next(sb, "resident:thinking");
    const res = await sa.emitWithAck("resident:ask", {
      residentId: "farah_hyd",
      question: "Why is dum cooking so important?",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.answer).toMatchObject({ residentId: "farah_hyd", channel: "canned" });
    expect(res.answer.text).toMatch(/sealed pot/);
    expect(await thinking).toEqual({ residentId: "farah_hyd", forId: a.user.id });
    await new Promise((r) => setTimeout(r, 50));
    expect(heard.map((m) => m.from.kind)).toEqual(["player", "resident"]);
    expect(heard[1]).toMatchObject({ to: { id: a.user.id }, channel: "canned" });

    const offTopic = await sa.emitWithAck("resident:ask", {
      residentId: "farah_hyd",
      question: "Who won the 1997 World Series?",
    });
    expect(offTopic).toMatchObject({ ok: true, answer: { channel: "redirect" } });

    const elsewhere = await sa.emitWithAck("resident:ask", {
      residentId: "layla_dxb",
      question: "gold?",
    });
    expect(elsewhere).toMatchObject({ ok: false, error: "not_found" });
  });

  it("moves a player between districts and hands over a second tab", async () => {
    const g = await t.guest("Traveller");
    const s1 = await t.connect(g.token);
    expect((await join(s1, "mum-marine-drive")).room.districtId).toBe("mum-marine-drive");
    expect((await join(s1, "sg-marina-bay")).room.districtId).toBe("sg-marina-bay");
    expect(t.server.realtime.rooms.roomOf(g.user.id)?.districtId).toBe("sg-marina-bay");

    const kicked = new Promise<void>((resolve) => s1.once("disconnect", () => resolve()));
    const s2 = await t.connect(g.token);
    await join(s2, "sg-marina-bay");
    await kicked;
    expect(t.server.realtime.rooms.member(g.user.id)?.socketId).toBe(s2.id);
  });

  it("shards a district when a room is full", async () => {
    const small = await startServer({ ROOM_CAPACITY: "2" });
    try {
      const rooms = [];
      for (const name of ["One", "Two", "Three"]) {
        const g = await small.guest(name);
        const s = await small.connect(g.token);
        rooms.push((await join(s, "nyc-midtown")).room.roomId);
      }
      expect(rooms).toEqual(["nyc-midtown#1", "nyc-midtown#1", "nyc-midtown#2"]);
    } finally {
      await small.close();
    }
  });
});
