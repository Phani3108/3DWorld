import { z } from "zod";
import type { ErrorCode, UserId } from "./session.ts";
import { Id } from "./world.ts";

/**
 * Socket.IO contract. Client → server payloads are zod-validated on the server;
 * server → client payloads are typed only (the server is trusted).
 *
 * Handshake: io(url, { auth: { token } }) with the bearer token from POST /v1/session.
 */

export const Anim = z.enum(["idle", "walk", "run", "sit", "wave", "talk", "dance"]);
export type Anim = z.infer<typeof Anim>;

/** Position in the district's local frame (see geo.ts). */
export const Pose = z.strictObject({
  x: z.number().gte(-5000).lte(5000),
  z: z.number().gte(-5000).lte(5000),
  heading: z
    .number()
    .gte(-Math.PI * 4)
    .lte(Math.PI * 4),
  anim: Anim,
});
export type Pose = z.infer<typeof Pose>;

export const PoseUpdate = Pose.extend({ seq: z.number().int().nonnegative() });
export type PoseUpdate = z.infer<typeof PoseUpdate>;

export const Emote = z.enum([
  "wave",
  "namaste",
  "salaam",
  "bow",
  "nod",
  "laugh",
  "cheer",
  "dance",
  "think",
  "point",
]);
export type Emote = z.infer<typeof Emote>;

export const ChatText = z.string().trim().min(1).max(500);

export const JoinRoomPayload = z.strictObject({ districtId: Id });
export const ChatSendPayload = z.strictObject({ text: ChatText });
export const EmotePayload = z.strictObject({ emote: Emote });
export const AskPayload = z.strictObject({ residentId: Id, question: ChatText });

export type PresencePlayer = {
  id: z.infer<typeof UserId>;
  name: string;
  avatarId: string;
  kind: "human" | "agent";
  pose: Pose;
};

export type ResidentPresence = { id: string; pose: Pose };

export type ChatAuthor =
  | { kind: "player"; id: string; name: string }
  | { kind: "resident"; id: string; name: string }
  | { kind: "system" };

export type ChatMessage = {
  id: string;
  roomId: string;
  from: ChatAuthor;
  text: string;
  at: string;
  /** Addressed to someone: a question to a resident, or a resident's reply to a player. */
  to?: { id: string; name: string };
  /** How a resident produced the reply. */
  channel?: AnswerChannel;
};

export type AnswerChannel = "canned" | "llm" | "redirect" | "stub";

export type ResidentAnswer = {
  residentId: string;
  text: string;
  channel: AnswerChannel;
  at: string;
};

export type RoomSnapshot = {
  roomId: string;
  cityId: string;
  districtId: string;
  self: PresencePlayer;
  players: PresencePlayer[];
  residents: ResidentPresence[];
  recentChat: ChatMessage[];
};

export type PoseBatch = { t: number; poses: Array<{ id: string } & Pose> };

export type Failure = { ok: false; error: ErrorCode; message?: string };
export type Result<T> = ({ ok: true } & T) | Failure;

export interface ClientToServerEvents {
  "room:join": (
    payload: z.infer<typeof JoinRoomPayload>,
    ack: (res: Result<{ room: RoomSnapshot }>) => void,
  ) => void;
  "room:leave": () => void;
  pose: (pose: PoseUpdate) => void;
  "chat:send": (
    payload: z.infer<typeof ChatSendPayload>,
    ack: (res: Result<{ message: ChatMessage }>) => void,
  ) => void;
  emote: (payload: z.infer<typeof EmotePayload>) => void;
  "resident:ask": (
    payload: z.infer<typeof AskPayload>,
    ack: (res: Result<{ answer: ResidentAnswer }>) => void,
  ) => void;
}

export interface ServerToClientEvents {
  "presence:join": (player: PresencePlayer) => void;
  "presence:leave": (payload: { id: string }) => void;
  poses: (batch: PoseBatch) => void;
  "chat:message": (message: ChatMessage) => void;
  emote: (payload: { id: string; emote: Emote }) => void;
  "resident:thinking": (payload: { residentId: string; forId: string }) => void;
  /** The server clamped your last pose (too fast, or out of bounds). Snap to this. */
  "pose:correct": (pose: Pose) => void;
  notice: (payload: { level: "info" | "warn"; text: string }) => void;
}

/** Movement limits the server enforces (metres, seconds). */
export const MOVEMENT = {
  walkSpeed: 1.4,
  runSpeed: 4.5,
  /** Allowed overshoot for jitter/latency before a pose is clamped. */
  tolerance: 1.5,
  poseHz: 10,
} as const;
