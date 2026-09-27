import { createHash, randomBytes } from "node:crypto";
import type { CreateSessionBody, Profile, UpdateProfileBody } from "@3dworld/contracts";
import { and, eq, gt } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { sessions, type UserRow, users } from "../db/schema.ts";

const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const TOKEN_PREFIX = "3dw_s_";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newUserId = () => `u_${randomBytes(12).toString("base64url")}`;
const newToken = () => `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;

export const toProfile = (row: UserRow): Profile => ({
  id: row.id,
  name: row.name,
  avatarId: row.avatarId,
  kind: row.kind,
  createdAt: row.createdAt.toISOString(),
});

export const createSessionStore = (db: Db) => ({
  /** New guest identity + bearer token. The token is returned once and stored hashed. */
  async createGuest(body: CreateSessionBody, now = new Date()) {
    const id = newUserId();
    const token = newToken();
    const [row] = await db
      .insert(users)
      .values({ id, name: body.name, avatarId: body.avatarId, kind: "human" })
      .returning();
    await db.insert(sessions).values({
      tokenHash: hashToken(token),
      userId: id,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    });
    return { user: toProfile(row!), token };
  },

  /** Resolve a bearer token to its user, or null if unknown/expired/malformed. */
  async resolve(token: unknown, now = new Date()): Promise<UserRow | null> {
    if (typeof token !== "string" || !token.startsWith(TOKEN_PREFIX) || token.length > 200)
      return null;
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
      .limit(1);
    return row?.user ?? null;
  },

  async update(userId: string, patch: UpdateProfileBody) {
    const [row] = await db
      .update(users)
      .set({ ...patch, lastSeenAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return row ? toProfile(row) : null;
  },

  async touch(userId: string) {
    await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, userId));
  },
});

export type SessionStore = ReturnType<typeof createSessionStore>;

/** Pull a bearer token from an Authorization header value. */
export const bearer = (header: string | undefined | null) => {
  if (!header) return null;
  const m = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return m?.[1] ?? null;
};
