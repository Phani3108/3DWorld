import type { World } from "@3dworld/content";
import {
  type ChatMessage,
  localFrame,
  MOVEMENT,
  type Pose,
  type PoseBatch,
  type PoseUpdate,
  type PresencePlayer,
  type ResidentPresence,
} from "@3dworld/contracts";

export type MemberInfo = Omit<PresencePlayer, "pose">;

type Member = MemberInfo & { socketId: string; pose: Pose; seq: number; lastPoseAt: number };

type Room = {
  id: string;
  cityId: string;
  districtId: string;
  radiusM: number;
  members: Map<string, Member>;
  chat: ChatMessage[];
  dirty: Set<string>;
};

const CHAT_HISTORY = 50;
/** How far past the district radius a player may wander before being pulled back (m). */
const BOUNDS_MARGIN_M = 50;

const presence = (m: Member): PresencePlayer => ({
  id: m.id,
  name: m.name,
  avatarId: m.avatarId,
  kind: m.kind,
  pose: m.pose,
});

/**
 * Rooms are shards of a district: `${districtId}#${n}`. Players fill the lowest
 * shard with space. Movement is client-driven and server-checked: every pose is
 * clamped to run speed (+ jitter tolerance) and to the district bounds.
 */
export const createRooms = (opts: { world: World; capacity: number; random?: () => number }) => {
  const { world, capacity } = opts;
  const random = opts.random ?? Math.random;
  const rooms = new Map<string, Room>();
  const roomOfUser = new Map<string, string>();

  const residentsByDistrict = new Map<string, ResidentPresence[]>();
  for (const d of world.districts.values()) {
    const frame = localFrame(d.origin);
    const spawn = frame.toLocal(d.spawn);
    const list: ResidentPresence[] = [];
    const perPlace = new Map<string, number>();
    for (const r of world.residents.values()) {
      const home = world.places.get(r.homePlaceId);
      if (!home || home.districtId !== d.id) continue;
      const i = perPlace.get(home.id) ?? 0;
      perPlace.set(home.id, i + 1);
      const c = frame.toLocal(home.location);
      // Hosts stand at the door; regulars fan out around them.
      const angle = i === 0 ? 0 : (i * 2 * Math.PI) / 5;
      const dist = i === 0 ? 0 : 2.5;
      const x = c.x + Math.sin(angle) * dist;
      const z = c.z + Math.cos(angle) * dist;
      const heading = Math.atan2(spawn.x - x, -(spawn.z - z));
      list.push({ id: r.id, pose: { x, z, heading, anim: "idle" } });
    }
    residentsByDistrict.set(d.id, list);
  }

  const snapshotFor = (room: Room, selfId: string) => {
    const self = room.members.get(selfId)!;
    return {
      roomId: room.id,
      cityId: room.cityId,
      districtId: room.districtId,
      self: presence(self),
      players: [...room.members.values()].filter((m) => m.id !== selfId).map(presence),
      residents: residentsByDistrict.get(room.districtId) ?? [],
      recentChat: room.chat.slice(-20),
    };
  };

  const pickRoom = (districtId: string): Room | null => {
    const district = world.districts.get(districtId);
    if (!district) return null;
    for (let n = 1; ; n++) {
      const id = `${districtId}#${n}`;
      const existing = rooms.get(id);
      if (!existing) {
        const room: Room = {
          id,
          cityId: district.cityId,
          districtId,
          radiusM: district.radiusM,
          members: new Map(),
          chat: [],
          dirty: new Set(),
        };
        rooms.set(id, room);
        return room;
      }
      if (existing.members.size < capacity) return existing;
    }
  };

  const leave = (userId: string) => {
    const roomId = roomOfUser.get(userId);
    if (!roomId) return null;
    roomOfUser.delete(userId);
    const room = rooms.get(roomId);
    if (!room) return null;
    room.members.delete(userId);
    room.dirty.delete(userId);
    if (room.members.size === 0) rooms.delete(room.id);
    return room.id;
  };

  const roomOf = (userId: string) => {
    const id = roomOfUser.get(userId);
    return id ? (rooms.get(id) ?? null) : null;
  };

  return {
    /** Join a district. If the user is already somewhere, they leave that room first. */
    join(districtId: string, info: MemberInfo, socketId: string, now = Date.now()) {
      const previous = roomOfUser.get(info.id);
      const previousSocket = previous
        ? rooms.get(previous)?.members.get(info.id)?.socketId
        : undefined;
      const left = leave(info.id);
      const room = pickRoom(districtId);
      if (!room) return { ok: false as const, error: "not_found" as const };
      const district = world.districts.get(districtId)!;
      const spawn = localFrame(district.origin).toLocal(district.spawn);
      const jitter = () => (random() - 0.5) * 4;
      // Arrive facing the heart of the district (its origin is the main landmark).
      const heading = Math.atan2(-spawn.x, spawn.z);
      room.members.set(info.id, {
        ...info,
        socketId,
        pose: { x: spawn.x + jitter(), z: spawn.z + jitter(), heading, anim: "idle" },
        seq: -1,
        lastPoseAt: now,
      });
      roomOfUser.set(info.id, room.id);
      return {
        ok: true as const,
        room: snapshotFor(room, info.id),
        left,
        replacedSocket: previousSocket && previousSocket !== socketId ? previousSocket : undefined,
      };
    },

    leave,

    roomOf,

    member(userId: string) {
      return roomOf(userId)?.members.get(userId) ?? null;
    },

    /** Apply a client pose. Returns the stored pose and whether it was corrected, or null if stale. */
    setPose(userId: string, update: PoseUpdate, now = Date.now()) {
      const room = roomOf(userId);
      const m = room?.members.get(userId);
      if (!room || !m || update.seq <= m.seq) return null;
      const dt = Math.max(0.05, (now - m.lastPoseAt) / 1000);
      const maxStep = MOVEMENT.runSpeed * dt + MOVEMENT.tolerance;
      let { x, z } = update;
      let corrected = false;
      const dx = x - m.pose.x;
      const dz = z - m.pose.z;
      const step = Math.hypot(dx, dz);
      if (step > maxStep) {
        x = m.pose.x + (dx / step) * maxStep;
        z = m.pose.z + (dz / step) * maxStep;
        corrected = true;
      }
      const limit = room.radiusM + BOUNDS_MARGIN_M;
      const r = Math.hypot(x, z);
      if (r > limit) {
        x = (x / r) * limit;
        z = (z / r) * limit;
        corrected = true;
      }
      m.pose = { x, z, heading: update.heading, anim: update.anim };
      m.seq = update.seq;
      m.lastPoseAt = now;
      room.dirty.add(userId);
      return { pose: m.pose, corrected, roomId: room.id };
    },

    addChat(roomId: string, message: ChatMessage) {
      const room = rooms.get(roomId);
      if (!room) return;
      room.chat.push(message);
      if (room.chat.length > CHAT_HISTORY) room.chat.splice(0, room.chat.length - CHAT_HISTORY);
    },

    residentsIn(districtId: string) {
      return residentsByDistrict.get(districtId) ?? [];
    },

    /** Collect pose changes since the last flush, per room. */
    flushPoses(now = Date.now()) {
      const out: Array<{ roomId: string; batch: PoseBatch }> = [];
      for (const room of rooms.values()) {
        if (room.dirty.size === 0) continue;
        const poses = [...room.dirty].flatMap((id) => {
          const m = room.members.get(id);
          return m ? [{ id, ...m.pose }] : [];
        });
        room.dirty.clear();
        if (poses.length > 0) out.push({ roomId: room.id, batch: { t: now, poses } });
      }
      return out;
    },

    stats() {
      return { rooms: rooms.size, players: roomOfUser.size };
    },
  };
};

export type Rooms = ReturnType<typeof createRooms>;
