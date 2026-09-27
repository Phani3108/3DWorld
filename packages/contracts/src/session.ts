import { z } from "zod";
import { Id } from "./world.ts";

export const UserId = z.string().regex(/^u_[A-Za-z0-9_-]{16,40}$/, "expected a user id");
export type UserId = z.infer<typeof UserId>;

/** Letters/marks/digits from any script, plus a few separators. No control or bidi characters. */
export const DisplayName = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(
    /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} ._'-]*$/u,
    "letters, numbers, spaces and . _ ' - only",
  );

export const Profile = z.strictObject({
  id: UserId,
  name: z.string(),
  avatarId: Id,
  kind: z.enum(["human", "agent"]),
  createdAt: z.iso.datetime(),
});
export type Profile = z.infer<typeof Profile>;

/** POST /v1/session — create a guest identity. */
export const CreateSessionBody = z.strictObject({
  name: DisplayName,
  avatarId: Id,
});
export type CreateSessionBody = z.infer<typeof CreateSessionBody>;

export const CreateSessionResponse = z.strictObject({
  user: Profile,
  /** Bearer token. Shown once; the server stores only its hash. */
  token: z.string(),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponse>;

/** PATCH /v1/me */
export const UpdateProfileBody = z
  .strictObject({ name: DisplayName.optional(), avatarId: Id.optional() })
  .refine((b) => b.name !== undefined || b.avatarId !== undefined, "nothing to update");
export type UpdateProfileBody = z.infer<typeof UpdateProfileBody>;

export const MeResponse = z.strictObject({ user: Profile });
export type MeResponse = z.infer<typeof MeResponse>;

export const AvatarOption = z.strictObject({
  id: Id,
  label: z.string(),
  presentation: z.enum(["feminine", "masculine", "neutral"]),
  /** Rigged glTF body, served by the web app. */
  model: z.string(),
  thumbnail: z.string().optional(),
  credit: z.string(),
});
export type AvatarOption = z.infer<typeof AvatarOption>;

export const ErrorCode = z.enum([
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "rate_limited",
  "conflict",
  "room_full",
  "internal_error",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const ErrorBody = z.strictObject({
  error: ErrorCode,
  message: z.string().optional(),
  issues: z.array(z.strictObject({ path: z.string(), message: z.string() })).optional(),
});
export type ErrorBody = z.infer<typeof ErrorBody>;
