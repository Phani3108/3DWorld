import { z } from "zod";

const csv = z
  .string()
  .default("")
  .transform((s) =>
    s
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
  );

const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(0).max(65_535).default(4000),
  /** postgres://… (Neon in production). Unset → embedded PGlite. */
  DATABASE_URL: z.string().optional(),
  /** PGlite data directory. Unset → in-memory (data is lost on restart). */
  PGLITE_DIR: z.string().optional(),
  /** Browser origins allowed to call the API (comma-separated). */
  CORS_ORIGINS: csv.pipe(z.array(z.url())),
  /** Honour X-Forwarded-For (set on Render/any reverse proxy). */
  TRUST_PROXY: z
    .enum(["0", "1"])
    .default("0")
    .transform((v) => v === "1"),
  ROOM_CAPACITY: z.coerce.number().int().min(2).max(500).default(40),
  /** Pause before a resident replies, so answers don't feel instant-canned (ms). */
  RESIDENT_REPLY_DELAY_MS: z.coerce.number().int().min(0).max(10_000).default(700),
});

export type Config = {
  env: "development" | "test" | "production";
  host: string;
  port: number;
  databaseUrl: string | undefined;
  pgliteDir: string | undefined;
  corsOrigins: string[];
  trustProxy: boolean;
  roomCapacity: number;
  residentReplyDelayMs: number;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const parsed = Env.safeParse(env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`invalid environment:\n${lines.join("\n")}`);
  }
  const e = parsed.data;
  return {
    env: e.NODE_ENV,
    host: e.HOST,
    port: e.PORT,
    databaseUrl: e.DATABASE_URL,
    pgliteDir: e.PGLITE_DIR,
    corsOrigins: e.CORS_ORIGINS.length > 0 ? e.CORS_ORIGINS : ["http://localhost:5180"],
    trustProxy: e.TRUST_PROXY,
    roomCapacity: e.ROOM_CAPACITY,
    residentReplyDelayMs: e.RESIDENT_REPLY_DELAY_MS,
  };
};
