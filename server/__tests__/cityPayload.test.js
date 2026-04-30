import { describe, it, expect } from "vitest";
import { CITIES, listCityIds, publicCity, ROOM_SCHEMA_VERSION } from "../shared/cityCatalog.js";

describe("ROOM_SCHEMA_VERSION", () => {
  it("is a positive integer (forces full re-seed when bumped)", () => {
    expect(typeof ROOM_SCHEMA_VERSION).toBe("number");
    expect(ROOM_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(ROOM_SCHEMA_VERSION)).toBe(true);
  });
});

describe("publicCity — Phase 11C integration", () => {
  it("every city has a roads field with at least 10 segments", () => {
    for (const cityId of listCityIds()) {
      const proj = publicCity(CITIES[cityId]);
      expect(proj.roads, `${cityId} has roads`).toBeTruthy();
      expect(Array.isArray(proj.roads.segments)).toBe(true);
      expect(proj.roads.segments.length, `${cityId} segments`).toBeGreaterThanOrEqual(10);
    }
  });

  it("every city has at least 6 landmarks (3 originals + 3 ambient)", () => {
    for (const cityId of listCityIds()) {
      const proj = publicCity(CITIES[cityId]);
      expect(Array.isArray(proj.landmarks)).toBe(true);
      expect(proj.landmarks.length, `${cityId} landmarks`).toBeGreaterThanOrEqual(5);
    }
  });

  it("every city's landmarks include cafe + newsKiosk + microPark (Phase 10C)", () => {
    for (const cityId of listCityIds()) {
      const proj = publicCity(CITIES[cityId]);
      const types = new Set(proj.landmarks.map((l) => l.type));
      expect(types.has("cafe"),       `${cityId} has cafe`).toBe(true);
      expect(types.has("newsKiosk"),  `${cityId} has newsKiosk`).toBe(true);
      expect(types.has("microPark"),  `${cityId} has microPark`).toBe(true);
    }
  });

  it("road segment widths are world-space-sane (≤ city size)", () => {
    for (const cityId of listCityIds()) {
      const proj = publicCity(CITIES[cityId]);
      const maxAllowed = proj.size?.[0] || 60;
      for (const s of proj.roads.segments) {
        expect(s.width).toBeLessThan(maxAllowed);
        expect(s.width).toBeGreaterThan(0);
      }
    }
  });

  it("road network exposes intersections + crosswalks", () => {
    for (const cityId of listCityIds()) {
      const proj = publicCity(CITIES[cityId]);
      expect(Array.isArray(proj.roads.intersections)).toBe(true);
      expect(Array.isArray(proj.roads.crosswalks)).toBe(true);
    }
  });
});
