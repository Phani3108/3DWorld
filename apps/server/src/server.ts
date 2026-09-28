import type { Server as HttpServer } from "node:http";
import { loadWorld, validateWorld, type World } from "@3dworld/content";
import { createAdaptorServer } from "@hono/node-server";
import { createSessionStore } from "./auth/sessions.ts";
import type { Config } from "./config.ts";
import { openDb } from "./db/client.ts";
import { createHttpApp } from "./http/app.ts";
import { attachRealtime } from "./realtime/io.ts";

/** Build the whole server without listening (tests listen on port 0). */
export const createServer = async (config: Config, world: World = loadWorld()) => {
  const report = validateWorld(world);
  if (report.errors.length > 0) {
    throw new Error(`content has ${report.errors.length} error(s):\n${report.errors.join("\n")}`);
  }
  const db = await openDb({ databaseUrl: config.databaseUrl, pgliteDir: config.pgliteDir });
  const sessions = createSessionStore(db.db);
  const app = createHttpApp({ config, world, sessions, dbKind: db.kind });
  const httpServer = createAdaptorServer({ fetch: app.fetch }) as HttpServer;
  const realtime = attachRealtime({ httpServer, config, world, sessions });

  return {
    app,
    httpServer,
    realtime,
    world,
    dbKind: db.kind,
    listen: (port = config.port, host = config.host) =>
      new Promise<number>((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(port, host, () => {
          const addr = httpServer.address();
          resolve(typeof addr === "object" && addr ? addr.port : port);
        });
      }),
    close: async () => {
      await realtime.close();
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
      await db.close();
    },
  };
};
