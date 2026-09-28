export * from "./geo.ts";
export * from "./geometry.ts";
export * from "./realtime.ts";
export * from "./session.ts";
export * from "./world.ts";

/** REST routes (all JSON; bearer auth where marked). */
export const ROUTES = {
  health: "GET /v1/health",
  createSession: "POST /v1/session",
  me: "GET /v1/me (auth)",
  updateMe: "PATCH /v1/me (auth)",
  avatars: "GET /v1/avatars",
  world: "GET /v1/world",
  city: "GET /v1/cities/:cityId",
  ask: "POST /v1/residents/:residentId/ask (auth)",
} as const;
