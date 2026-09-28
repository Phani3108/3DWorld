import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startServer } from "./helpers.ts";

let t: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => {
  t = await startServer();
});
afterAll(async () => {
  await t.close();
});

describe("http api", () => {
  it("reports health with the content version and db kind", async () => {
    const res = await t.api("/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, db: "pglite" });
    expect(res.body.content).toMatch(/^[0-9a-f]{12}$/);
  });

  it("creates a guest session and resolves it", async () => {
    const { user, token } = await t.guest("Zara", "body-f-young");
    expect(user.id).toMatch(/^u_/);
    expect(token).toMatch(/^3dw_s_/);
    const me = await t.api("/v1/me", { token });
    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({
      id: user.id,
      name: "Zara",
      avatarId: "body-f-young",
      kind: "human",
    });
  });

  it("rejects bad session bodies", async () => {
    const cases = [
      { name: "", avatarId: "body-f-young" },
      { name: "<b>hi</b>", avatarId: "body-f-young" },
      { name: "Zara", avatarId: "body-dragon" },
      { name: "Zara", avatarId: "body-f-young", admin: true },
    ];
    for (const json of cases) {
      const res = await t.api("/v1/session", { method: "POST", json });
      expect(res.status, JSON.stringify(json)).toBe(400);
    }
    const notJson = await t.api("/v1/session", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    });
    expect(notJson.status).toBe(400);
  });

  it("requires a valid bearer token", async () => {
    expect((await t.api("/v1/me")).status).toBe(401);
    expect((await t.api("/v1/me", { token: "3dw_s_nope" })).status).toBe(401);
    expect((await t.api("/v1/me", { token: "x".repeat(500) })).status).toBe(401);
  });

  it("updates the profile", async () => {
    const { token } = await t.guest();
    const res = await t.api("/v1/me", {
      method: "PATCH",
      token,
      json: { name: "Farhan", avatarId: "body-m-adult" },
    });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: "Farhan", avatarId: "body-m-adult" });
    expect((await t.api("/v1/me", { method: "PATCH", token, json: {} })).status).toBe(400);
  });

  it("serves the public world without private content", async () => {
    const world = await t.api("/v1/world");
    expect(world.status).toBe(200);
    expect(world.body.cities).toHaveLength(7);
    const city = await t.api("/v1/cities/hyderabad");
    expect(city.status).toBe(200);
    expect(city.body.residents.map((r: { id: string }) => r.id)).toContain("farah_hyd");
    const raw = JSON.stringify([world.body, city.body]);
    expect(raw).not.toMatch(/"persona"|"canned"|"keywords"/);
    expect((await t.api("/v1/cities/atlantis")).status).toBe(404);
    expect((await t.api("/v1/cities/__proto__")).status).toBe(404);
  });

  it("answers a resident question over REST", async () => {
    const { token } = await t.guest();
    const res = await t.api("/v1/residents/zara_hyd/ask", {
      method: "POST",
      token,
      json: { question: "how long does dum take?" },
    });
    expect(res.status).toBe(200);
    expect(res.body.answer).toMatchObject({ residentId: "zara_hyd", channel: "canned" });
    expect(res.body.answer.text).toMatch(/Thirty-five minutes/);
    const unknown = await t.api("/v1/residents/nobody/ask", {
      method: "POST",
      token,
      json: { question: "hi" },
    });
    expect(unknown.status).toBe(404);
  });

  it("answers CORS preflights only for allowed origins", async () => {
    const ok = await t.api("/v1/session", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5180",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,authorization",
      },
    });
    expect(ok.headers.get("access-control-allow-origin")).toBe("http://localhost:5180");
    expect(ok.headers.get("access-control-max-age")).toBe("600");
    const evil = await t.api("/v1/session", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example", "access-control-request-method": "POST" },
    });
    expect(evil.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("returns JSON 404s for unknown routes", async () => {
    const res = await t.api("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "not_found" });
  });
});
