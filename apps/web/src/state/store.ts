import type { ChatMessage, Pose, PresencePlayer, Profile } from "@3dworld/contracts";
import { atom, createStore } from "jotai";
import { storage } from "../lib/storage.ts";

/** One jotai store, so realtime handlers outside React can write to it. */
export const store = createStore();

export type Session = { token: string; user: Profile };
const SESSION_KEY = "3dworld.session.v1";
const PLACE_KEY = "3dworld.place.v1";

const persisted = <T>(key: string, initial: T) => {
  const base = atom<T>(storage.get(key, initial));
  return atom(
    (get) => get(base),
    (_get, set, next: T) => {
      set(base, next);
      if (next === null || next === undefined) storage.remove(key);
      else storage.set(key, next);
    },
  );
};

export const sessionAtom = persisted<Session | null>(SESSION_KEY, null);
/** Where the player is (or last was). */
export const placeAtom = persisted<{ cityId: string; districtId: string } | null>(PLACE_KEY, null);

export type Connection = "idle" | "connecting" | "online" | "offline";
export const connectionAtom = atom<Connection>("idle");
export const roomIdAtom = atom<string | null>(null);

/** Other players in the room (membership only — poses live in `poses`). */
export const playersAtom = atom<Map<string, Omit<PresencePlayer, "pose">>>(new Map());
export const chatAtom = atom<ChatMessage[]>([]);
/** residentId → asker id, while a resident is composing a reply. */
export const thinkingAtom = atom<Record<string, string>>({});

export const panelAtom = atom<"chats" | "nearby" | "map" | "me" | null>("chats");
export const paletteOpenAtom = atom(false);
/** Something the player asked to walk to (Nearby list, palette, click). */
export const walkTargetAtom = atom<{ x: number; z: number; label: string } | null>(null);
/** Composer prefill, e.g. "@Farah ". */
export const composerDraftAtom = atom<string>("");

/** Screen-reader narration (polite). */
export const narrationAtom = atom<string>("");
export const narrate = (text: string) => store.set(narrationAtom, text);

/**
 * High-frequency pose data, read every frame by the scene. Not React state:
 * updating React 10×/s per player would re-render the whole tree.
 */
export type Motion = { from: Pose; to: Pose; at: number };
export const poses = new Map<string, Motion>();
export const selfPose: { current: Pose } = { current: { x: 0, z: 0, heading: 0, anim: "idle" } };

export const setPose = (id: string, pose: Pose, now = performance.now()) => {
  const prev = poses.get(id);
  poses.set(id, { from: prev ? currentPose(prev, now) : pose, to: pose, at: now });
};

/** Interpolate toward the latest server pose over ~one network tick. */
export const currentPose = (m: Motion, now = performance.now()): Pose => {
  const k = Math.min(1, (now - m.at) / 120);
  const turn = Math.atan2(
    Math.sin(m.to.heading - m.from.heading),
    Math.cos(m.to.heading - m.from.heading),
  );
  return {
    x: m.from.x + (m.to.x - m.from.x) * k,
    z: m.from.z + (m.to.z - m.from.z) * k,
    heading: m.from.heading + turn * k,
    anim: m.to.anim,
  };
};
