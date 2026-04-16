import { describe, it, expect } from "vitest";
import { bondKey, getBondLevel, applyBondProgress, BOND_LEVELS } from "../bondSystem.js";

describe("bondKey", () => {
  it("produces a canonical key regardless of argument order", () => {
    expect(bondKey("Alice", "Bob")).toBe(bondKey("Bob", "Alice"));
  });

  it("is case-insensitive", () => {
    expect(bondKey("ALICE", "bob")).toBe("alice::bob");
  });
});

describe("getBondLevel", () => {
  it("returns 0 for score 0", () => {
    expect(getBondLevel(0)).toBe(0);
  });

  it("returns correct level at threshold boundaries", () => {
    expect(getBondLevel(3)).toBe(1);
    expect(getBondLevel(8)).toBe(2);
    expect(getBondLevel(40)).toBe(5);
  });

  it("returns highest when score exceeds max threshold", () => {
    expect(getBondLevel(100)).toBe(BOND_LEVELS.length - 1);
  });
});

describe("applyBondProgress", () => {
  it("creates a new bond entry on first interaction", () => {
    const bondsMap = new Map();
    const result = applyBondProgress({
      bondsMap,
      senderName: "Alice",
      targetName: "Bob",
      eventType: "chat",
      baseDelta: 1.0,
      cooldownMs: 0,
    });
    expect(result).not.toBeNull();
    expect(result.bond.score).toBe(1);
    expect(bondsMap.size).toBe(1);
  });

  it("respects cooldown — second call within cooldown returns null", () => {
    const bondsMap = new Map();
    const now = Date.now();
    applyBondProgress({
      bondsMap, senderName: "A", targetName: "B",
      eventType: "chat", baseDelta: 1, cooldownMs: 10000, now,
    });
    const second = applyBondProgress({
      bondsMap, senderName: "A", targetName: "B",
      eventType: "chat", baseDelta: 1, cooldownMs: 10000, now: now + 5000,
    });
    expect(second).toBeNull();
  });

  it("caps score at 100", () => {
    const bondsMap = new Map();
    bondsMap.set("a::b", { score: 99.5, cooldowns: {}, lastWave: 0, lastInteractionAt: 0 });
    const result = applyBondProgress({
      bondsMap, senderName: "A", targetName: "B",
      eventType: "chat", baseDelta: 5, cooldownMs: 0,
    });
    expect(result.bond.score).toBe(100);
  });

  it("rejects self-bond", () => {
    const bondsMap = new Map();
    const result = applyBondProgress({
      bondsMap, senderName: "Alice", targetName: "Alice",
      eventType: "chat", baseDelta: 1, cooldownMs: 0,
    });
    expect(result).toBeNull();
  });

  it("rejects missing names", () => {
    expect(applyBondProgress({
      bondsMap: new Map(), senderName: "", targetName: "B",
      eventType: "chat", baseDelta: 1, cooldownMs: 0,
    })).toBeNull();
  });
});
