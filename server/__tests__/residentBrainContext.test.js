import { describe, it, expect, afterEach } from "vitest";
import { buildResidentCard, WORLD_BIBLE } from "../llm/promptBuilder.js";
import { getResident, listResidentIds } from "../shared/residentCatalog.js";
import { resolveResident, inCharacterRedirect } from "../residentService.js";
import { cityLocalTime, weeklyWindowRemainingMs } from "../shared/cityTime.js";
import { EVENTS, isLive } from "../shared/eventsCatalog.js";
import { canSpend, beginRequest, __resetCostGuards } from "../llm/costGuards.js";

describe("resident character cards", () => {
  it("are byte-identical across builds (prompt-cache stable)", () => {
    for (const id of listResidentIds()) {
      const r = getResident(id);
      expect(buildResidentCard(r)).toBe(buildResidentCard(r));
    }
  });

  it("give regulars their own identity, not the host's persona", () => {
    const card = buildResidentCard(getResident("zara_hyd"));
    expect(card).toContain("You are Zara, a regular at Paradise Biryani House in Hyderabad, India.");
    expect(card).not.toContain("You are Farah");
  });

  it("carry the curated corpus the old prompt never sent", () => {
    const host = buildResidentCard(getResident("farah_hyd"));
    expect(host).toContain("Answers you have given before");
    expect(host).toContain("Secunderabad");
    expect(host).toContain("On the menu:");
  });

  it("the shared world bible is long enough to cache on its own", () => {
    // Opus 5.5's minimum cacheable prefix is 512 tokens; ~4 chars/token is conservative.
    expect(WORLD_BIBLE.length / 4).toBeGreaterThan(512);
    expect(WORLD_BIBLE).toMatch(/AI character/);
  });
});

describe("resident resolution (every client id shape reaches a resident)", () => {
  it.each([
    ["farah_hyd", "farah_hyd"],
    ["resident:farah_hyd", "farah_hyd"],
    ["resident_farah_hyd", "farah_hyd"],
    ["Farah", "farah_hyd"],
    ["hyd_paradise_biryani", "farah_hyd"], // venue id → its host
    ["blr_mtr", "arjun_blr"], // host, not the regular Ravi
  ])("%s → %s", (input, expected) => {
    expect(resolveResident(input)?.id).toBe(expected);
  });

  it("returns null for unknown or prototype ids", () => {
    expect(resolveResident("nobody_here")).toBeNull();
    expect(resolveResident("__proto__")).toBeNull();
    expect(resolveResident("constructor")).toBeNull();
  });

  it("redirects in character instead of dead-ending", () => {
    const line = inCharacterRedirect(getResident("farah_hyd"));
    expect(line).toMatch(/Ask me about/);
  });
});

describe("city-local clock", () => {
  it("reads each city's own timezone, not the server's", () => {
    const at = new Date("2026-09-23T00:00:00Z");
    expect(cityLocalTime("sydney", at)).toMatchObject({ weekday: "Wed", hour: 10 });
    expect(cityLocalTime("newyork", at)).toMatchObject({ weekday: "Tue", hour: 20 });
    expect(cityLocalTime("hyderabad", at)).toMatchObject({ weekday: "Wed", hour: 5, minute: 30 });
  });

  it("handles weekly windows that wrap past Saturday midnight", () => {
    const sched = { dayOfWeek: 6, startHour: 22, durationHours: 4 }; // Sat 22:00 → Sun 02:00
    const sunOneAmIst = new Date("2026-09-26T19:30:00Z");
    expect(weeklyWindowRemainingMs("hyderabad", sched, sunOneAmIst)).toBe(60 * 60_000);
  });

  it("events go live on local time", () => {
    const e = EVENTS.hyd_weekend_biryani; // Sun 12:00–16:00 IST
    expect(isLive(e, new Date("2026-09-27T07:30:00Z"))).toBeTruthy(); // 13:00 IST
    expect(isLive(e, new Date("2026-09-27T11:30:00Z"))).toBeNull();   // 17:00 IST
  });
});

describe("dollar-based cost guards", () => {
  afterEach(() => {
    delete process.env.LLM_DAILY_BUDGET_USD;
    delete process.env.LLM_USER_DAILY_TURNS;
    __resetCostGuards();
  });

  it("stops all LLM turns once the day's budget is spent", () => {
    process.env.LLM_DAILY_BUDGET_USD = "0.05";
    __resetCostGuards();
    beginRequest("u_budget_a", "farah_hyd")(0.06);
    expect(canSpend("u_budget_b", "zara_hyd")).toMatchObject({ ok: false, reason: "daily_budget" });
  });

  it("caps turns per visitor per day", () => {
    process.env.LLM_USER_DAILY_TURNS = "2";
    __resetCostGuards();
    beginRequest("u_turns", "farah_hyd")(0);
    beginRequest("u_turns", "farah_hyd")(0);
    expect(canSpend("u_turns", "farah_hyd")).toMatchObject({ ok: false, reason: "daily_turns" });
    expect(canSpend("u_other", "farah_hyd").ok).toBe(true);
  });
});
