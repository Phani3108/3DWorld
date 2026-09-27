import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "./schema.ts";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export type DbHandle = {
  db: Db;
  kind: "postgres" | "pglite";
  close: () => Promise<void>;
};

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

/**
 * Postgres when DATABASE_URL is set (Neon in production), otherwise embedded
 * PGlite — on disk when a directory is given, in memory for tests.
 * Migrations run on every boot; they are idempotent.
 */
export const openDb = async (opts: {
  databaseUrl?: string | undefined;
  pgliteDir?: string | undefined;
}): Promise<DbHandle> => {
  if (opts.databaseUrl) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new pg.Pool({ connectionString: opts.databaseUrl, max: 5 });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder });
    return { db: db as unknown as Db, kind: "postgres", close: () => pool.end() };
  }
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  if (opts.pgliteDir) mkdirSync(opts.pgliteDir, { recursive: true });
  const client = await PGlite.create(opts.pgliteDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return { db: db as unknown as Db, kind: "pglite", close: () => client.close() };
};
