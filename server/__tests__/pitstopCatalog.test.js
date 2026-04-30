import { describe, it, expect } from "vitest";
import { PITSTOPS, listPitstopIds, getPitstop, pitstopsInCity, allPitstopsPublic } from "../shared/pitstopCatalog.js";
import { CITIES } from "../shared/cityCatalog.js";

const KIND_ENUM = new Set(["chai_stall", "bus_stop", "vista", "fountain_bench", "newsstand"]);

describe("pitstopCatalog completeness", () => {
  it("every entry has id, cityId, position, kind, prop, theme, line", () => {
    for (const [id, p] of Object.entries(PITSTOPS)) {
      expect(p.id, `${id} id`).toBe(id);
      expect(typeof p.cityId, `${id} cityId`).toBe("string");
      expect(Array.isArray(p.position) && p.position.length === 2, `${id} position`).toBe(true);
      expect(KIND_ENUM.has(p.kind), `${id} kind=${p.kind}`).toBe(true);
      expect(typeof p.prop).toBe("string");
      expect(typeof p.theme).toBe("string");
      expect(typeof p.line).toBe("string");
      expect(p.line.length).toBeGreaterThan(8);
    }
  });

  it("every pitstop's cityId references a known city", () => {
    const cityIds = new Set(Object.keys(CITIES));
    for (const p of Object.values(PITSTOPS)) {
      expect(cityIds.has(p.cityId), `${p.id}: cityId=${p.cityId}`).toBe(true);
    }
  });

  it("every city has 4 or more pitstops (min density target)", () => {
    for (const cityId of Object.keys(CITIES)) {
      const list = pitstopsInCity(cityId);
      expect(list.length, `${cityId}`).toBeGreaterThanOrEqual(4);
    }
  });

  it("positions are inside the 60×60 grid", () => {
    for (const p of Object.values(PITSTOPS)) {
      const [x, z] = p.position;
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(60);
      expect(z).toBeGreaterThan(0);
      expect(z).toBeLessThan(60);
    }
  });

  it("ids are globally unique", () => {
    const seen = new Set();
    for (const p of Object.values(PITSTOPS)) {
      expect(seen.has(p.id), `duplicate id: ${p.id}`).toBe(false);
      seen.add(p.id);
    }
  });
});

describe("getPitstop / pitstopsInCity / allPitstopsPublic", () => {
  it("getPitstop returns null for unknown ids", () => {
    expect(getPitstop("nope")).toBeNull();
  });
  it("pitstopsInCity narrows correctly", () => {
    const hyd = pitstopsInCity("hyderabad");
    for (const p of hyd) expect(p.cityId).toBe("hyderabad");
  });
  it("allPitstopsPublic returns ≥ 28 entries (≥ 4 per 7 cities)", () => {
    expect(allPitstopsPublic().length).toBeGreaterThanOrEqual(28);
  });
  it("listPitstopIds matches catalog size", () => {
    expect(listPitstopIds().length).toBe(Object.keys(PITSTOPS).length);
  });
});
