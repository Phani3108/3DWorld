import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

const REP_FILE = path.join(process.cwd(), "reputation.json");
const cleanState = () => { try { if (fs.existsSync(REP_FILE)) fs.unlinkSync(REP_FILE); } catch {} };

beforeEach(() => cleanState());

describe("addReputation", () => {
  it("returns 0 for unknown user/city", async () => {
    const r = await import("../reputationService.js");
    expect(r.getReputation("nobody", "hyderabad")).toBe(0);
  });

  it("increments and persists", async () => {
    const r = await import("../reputationService.js");
    r.addReputation("u_rep_a", "hyderabad", 10);
    r.addReputation("u_rep_a", "hyderabad", 5);
    expect(r.getReputation("u_rep_a", "hyderabad")).toBe(15);
  });

  it("clamps below zero to zero", async () => {
    const r = await import("../reputationService.js");
    r.addReputation("u_rep_b", "mumbai", 5);
    r.addReputation("u_rep_b", "mumbai", -100);
    expect(r.getReputation("u_rep_b", "mumbai")).toBe(0);
  });

  it("scopes per-city — Hyderabad rep doesn't leak into Mumbai", async () => {
    const r = await import("../reputationService.js");
    r.addReputation("u_rep_c", "hyderabad", 50);
    expect(r.getReputation("u_rep_c", "hyderabad")).toBe(50);
    expect(r.getReputation("u_rep_c", "mumbai")).toBe(0);
  });
});

describe("reputationTier", () => {
  it("maps thresholds to the correct tier", async () => {
    const r = await import("../reputationService.js");
    expect(r.reputationTier(0).label).toBe("Unknown");
    expect(r.reputationTier(25).label).toBe("Familiar");
    expect(r.reputationTier(75).label).toBe("Welcome");
    expect(r.reputationTier(200).label).toBe("Regular");
    expect(r.reputationTier(500).label).toBe("Local Hero");
    // Above max stays at the top tier
    expect(r.reputationTier(9999).label).toBe("Local Hero");
  });

  it("preserves the score in the returned tier", async () => {
    const r = await import("../reputationService.js");
    expect(r.reputationTier(123).score).toBe(123);
  });

  it("treats negative input as 0", async () => {
    const r = await import("../reputationService.js");
    expect(r.reputationTier(-50).score).toBe(0);
  });
});

describe("cityLeaderboard", () => {
  it("orders by score desc and excludes zeros", async () => {
    const r = await import("../reputationService.js");
    r.addReputation("u_lb_alice", "newyork", 80);
    r.addReputation("u_lb_bob",   "newyork", 30);
    r.addReputation("u_lb_carol", "newyork", 0); // shouldn't appear
    r.addReputation("u_lb_dave",  "mumbai", 999); // wrong city
    const lb = r.cityLeaderboard("newyork", 10);
    expect(lb.map((e) => e.userId)).toEqual(["u_lb_alice", "u_lb_bob"]);
  });

  it("respects the limit", async () => {
    const r = await import("../reputationService.js");
    for (let i = 0; i < 5; i++) r.addReputation(`u_lb_${i}`, "sydney", i + 1);
    expect(r.cityLeaderboard("sydney", 3).length).toBe(3);
  });
});

describe("getUserReputation", () => {
  it("returns sorted city scores for a user", async () => {
    const r = await import("../reputationService.js");
    r.addReputation("u_user_rep", "mumbai",   40);
    r.addReputation("u_user_rep", "newyork",  100);
    r.addReputation("u_user_rep", "sydney",   10);
    const out = r.getUserReputation("u_user_rep");
    expect(out[0].cityId).toBe("newyork");
    expect(out[2].cityId).toBe("sydney");
  });
});
