import { cityDetail, type World, worldSnapshot } from "@3dworld/content";
import {
  ChatText,
  CreateSessionBody,
  type ErrorBody,
  type ErrorCode,
  UpdateProfileBody,
} from "@3dworld/contracts";
import { getConnInfo } from "@hono/node-server/conninfo";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { bearer, type SessionStore, toProfile } from "../auth/sessions.ts";
import { answerFromContent } from "../brain/answer.ts";
import type { Config } from "../config.ts";
import type { UserRow } from "../db/schema.ts";
import { createRateLimiter } from "../rateLimit.ts";

type Env = { Variables: { user: UserRow } };

const STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  room_full: 503,
  internal_error: 500,
};

const fail = (c: Context, error: ErrorCode, extra: Omit<ErrorBody, "error"> = {}) =>
  c.json({ error, ...extra } satisfies ErrorBody, STATUS[error]);

const readJson = async <T>(c: Context, schema: z.ZodType<T>) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return { ok: false as const, res: fail(c, "bad_request", { message: "body must be JSON" }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return { ok: false as const, res: fail(c, "bad_request", { issues }) };
  }
  return { ok: true as const, data: parsed.data };
};

export const createHttpApp = (deps: {
  config: Config;
  world: World;
  sessions: SessionStore;
  dbKind: string;
}) => {
  const { config, world, sessions } = deps;
  const avatarIds = new Set(world.avatars.map((a) => a.id));
  const sessionLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });
  const askLimiter = createRateLimiter({ limit: 6, windowMs: 60 * 1000 });
  const sweep = setInterval(() => {
    sessionLimiter.sweep();
    askLimiter.sweep();
  }, 60_000);
  sweep.unref();

  const clientIp = (c: Context) => {
    if (config.trustProxy) {
      const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      if (fwd) return fwd;
    }
    try {
      return getConnInfo(c).remote.address ?? "unknown";
    } catch {
      return "unknown";
    }
  };

  const app = new Hono<Env>();

  app.use(
    "*",
    cors({
      origin: config.corsOrigins,
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: ["Authorization", "Content-Type"],
      maxAge: 600,
    }),
  );
  app.use("*", secureHeaders({ crossOriginResourcePolicy: "cross-origin" }));
  app.use(
    "*",
    bodyLimit({
      maxSize: 16 * 1024,
      onError: (c) => fail(c, "bad_request", { message: "body too large" }),
    }),
  );

  const auth = async (c: Context<Env>, next: () => Promise<void>) => {
    const user = await sessions.resolve(bearer(c.req.header("authorization")));
    if (!user) return fail(c, "unauthorized");
    c.set("user", user);
    await next();
  };

  app.get("/v1/health", (c) => c.json({ ok: true, content: world.version, db: deps.dbKind }));

  app.post("/v1/session", async (c) => {
    if (!sessionLimiter.take(clientIp(c))) return fail(c, "rate_limited");
    const body = await readJson(c, CreateSessionBody);
    if (!body.ok) return body.res;
    if (!avatarIds.has(body.data.avatarId))
      return fail(c, "bad_request", { message: "unknown avatar" });
    return c.json(await sessions.createGuest(body.data), 201);
  });

  app.get("/v1/me", auth, (c) => c.json({ user: toProfile(c.get("user")) }));

  app.patch("/v1/me", auth, async (c) => {
    const body = await readJson(c, UpdateProfileBody);
    if (!body.ok) return body.res;
    if (body.data.avatarId && !avatarIds.has(body.data.avatarId)) {
      return fail(c, "bad_request", { message: "unknown avatar" });
    }
    const user = await sessions.update(c.get("user").id, body.data);
    return user ? c.json({ user }) : fail(c, "not_found");
  });

  app.get("/v1/avatars", (c) => c.json({ avatars: world.avatars }));

  app.get("/v1/world", (c) => {
    c.header("Cache-Control", "public, max-age=300");
    return c.json(worldSnapshot(world));
  });

  app.get("/v1/cities/:cityId", (c) => {
    const detail = cityDetail(world, c.req.param("cityId"));
    if (!detail) return fail(c, "not_found");
    c.header("Cache-Control", "public, max-age=300");
    return c.json(detail);
  });

  app.post("/v1/residents/:residentId/ask", auth, async (c) => {
    const user = c.get("user");
    if (!askLimiter.take(user.id)) return fail(c, "rate_limited");
    const body = await readJson(c, z.strictObject({ question: ChatText }));
    if (!body.ok) return body.res;
    const residentId = c.req.param("residentId") ?? "";
    const answer = answerFromContent(world, residentId, body.data.question);
    if (!answer) return fail(c, "not_found");
    return c.json({ answer: { residentId, ...answer, at: new Date().toISOString() } });
  });

  app.notFound((c) => fail(c, "not_found"));
  app.onError((err, c) => {
    console.error("[http]", c.req.method, c.req.path, err);
    return fail(c, "internal_error");
  });

  return app;
};
