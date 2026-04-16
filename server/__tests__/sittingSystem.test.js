import { describe, it, expect } from "vitest";
import {
  ensureSeatMaps,
  normalizeAngle,
  DEFAULT_SIT_FACING_OFFSET,
} from "../sittingSystem.js";

describe("ensureSeatMaps", () => {
  it("initializes Maps on room without them", () => {
    const room = {};
    ensureSeatMaps(room);
    expect(room.seatOccupancy).toBeInstanceOf(Map);
    expect(room.characterSeats).toBeInstanceOf(Map);
  });

  it("does not overwrite existing Maps", () => {
    const existing = new Map([["k", "v"]]);
    const room = { seatOccupancy: existing, characterSeats: new Map() };
    ensureSeatMaps(room);
    expect(room.seatOccupancy).toBe(existing);
  });
});

describe("normalizeAngle", () => {
  it("wraps angles to [-PI, PI]", () => {
    const result = normalizeAngle(3 * Math.PI);
    expect(result).toBeCloseTo(Math.PI, 5);
  });

  it("returns 0 for 0", () => {
    expect(normalizeAngle(0)).toBe(0);
  });
});

describe("DEFAULT_SIT_FACING_OFFSET", () => {
  it("equals Math.PI", () => {
    expect(DEFAULT_SIT_FACING_OFFSET).toBe(Math.PI);
  });
});
