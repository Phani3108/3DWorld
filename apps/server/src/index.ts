import { loadConfig } from "./config.ts";
import { createServer } from "./server.ts";

process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));

const config = loadConfig();
const server = await createServer(config);
const port = await server.listen();
console.log(
  `3D World server on http://${config.host}:${port} · db=${server.dbKind} · content=${server.world.version} · cors=${config.corsOrigins.join(",")}`,
);

const shutdown = async (signal: string) => {
  console.log(`${signal} — shutting down`);
  await server.close().catch((err) => console.error(err));
  process.exit(0);
};
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
