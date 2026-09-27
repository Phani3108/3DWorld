import type { ClientToServerEvents, ServerToClientEvents } from "@3dworld/contracts";
import { io, type Socket } from "socket.io-client";
import { loadConfig } from "../src/config.ts";
import { createServer } from "../src/server.ts";

export type TestClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export const startServer = async (env: Record<string, string> = {}) => {
  const config = loadConfig({ NODE_ENV: "test", RESIDENT_REPLY_DELAY_MS: "0", ...env });
  const server = await createServer(config);
  const port = await server.listen(0, "127.0.0.1");
  const base = `http://127.0.0.1:${port}`;
  const clients: TestClient[] = [];

  const api = async (path: string, init: RequestInit & { token?: string; json?: unknown } = {}) => {
    const headers = new Headers(init.headers);
    if (init.token) headers.set("authorization", `Bearer ${init.token}`);
    if (init.json !== undefined) headers.set("content-type", "application/json");
    const res = await fetch(base + path, {
      ...init,
      headers,
      ...(init.json !== undefined ? { body: JSON.stringify(init.json) } : {}),
    });
    const text = await res.text();
    return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
  };

  const guest = async (name = "Tester", avatarId = "body-f-young") => {
    const res = await api("/v1/session", { method: "POST", json: { name, avatarId } });
    if (res.status !== 201)
      throw new Error(`session failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body as { user: { id: string; name: string }; token: string };
  };

  const connect = (token: string | undefined) =>
    new Promise<TestClient>((resolve, reject) => {
      const socket: TestClient = io(base, {
        auth: token ? { token } : {},
        transports: ["websocket"],
        reconnection: false,
        forceNew: true,
      });
      clients.push(socket);
      socket.once("connect", () => resolve(socket));
      socket.once("connect_error", (err) => reject(err));
    });

  return {
    server,
    base,
    api,
    guest,
    connect,
    close: async () => {
      for (const c of clients) c.disconnect();
      await server.close();
    },
  };
};

/** Resolve with the next event of a given name (or reject after a timeout). */
export const next = <K extends keyof ServerToClientEvents>(
  socket: TestClient,
  event: K,
  ms = 3000,
) =>
  new Promise<Parameters<ServerToClientEvents[K]>[0]>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for ${String(event)}`)), ms);
    socket.once(event, ((payload: Parameters<ServerToClientEvents[K]>[0]) => {
      clearTimeout(timer);
      resolve(payload);
    }) as never);
  });
