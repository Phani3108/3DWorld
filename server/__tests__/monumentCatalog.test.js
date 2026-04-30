import { describe, it, expect } from "vitest";
import { MONUMENTS, listMonumentTypes, getMonument, allMonumentsPublic } from "../shared/monumentCatalog.js";
import { CITIES } from "../shared/cityCatalog.js";

// Phase 10C — ambient buildings (cafés / news kiosks / micro-parks)
// are visual-only landmarks with no monument entry. Skip them in the
// monument completeness check.
const AMBIENT_LANDMARK_TYPES = new Set(["cafe", "newsKiosk", "microPark"]);

describe("monumentCatalog completeness", () => {
  it("every city's NON-ambient landmark has a matching monument entry", () => {
    const missing = [];
    for (const city of Object.values(CITIES)) {
      for (const lm of city.landmarks || []) {
        if (AMBIENT_LANDMARK_TYPES.has(lm.type)) continue;
        if (!MONUMENTS[lm.type]) missing.push(`${city.id}/${lm.type}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every monument has photoUrl + builtYear + blurb + attribution", () => {
    for (const [type, m] of Object.entries(MONUMENTS)) {
      expect(typeof m.photoUrl, `${type} photoUrl`).toBe("string");
      expect(m.photoUrl.startsWith("/images/monuments/"), `${type} photoUrl path`).toBe(true);
      expect(typeof m.builtYear, `${type} builtYear`).toBe("number");
      expect(typeof m.blurb, `${type} blurb`).toBe("string");
      expect(m.blurb.length).toBeGreaterThan(20);
      expect(typeof m.attribution, `${type} attribution`).toBe("string");
      expect(m.attribution.length).toBeGreaterThan(0);
    }
  });

  it("attribution strings reference a known license tag", () => {
    const known = /CC[\s-]?(BY|0)|GFDL|public domain/i;
    for (const [type, m] of Object.entries(MONUMENTS)) {
      expect(known.test(m.attribution), `${type}: "${m.attribution}"`).toBe(true);
    }
  });
});

describe("getMonument", () => {
  it("returns null for unknown types", () => {
    expect(getMonument("nope")).toBeNull();
    expect(getMonument(undefined)).toBeNull();
  });

  it("returns the catalog entry for known types", () => {
    const c = getMonument("charminar");
    expect(c?.builtYear).toBe(1591);
  });
});

describe("listMonumentTypes / allMonumentsPublic", () => {
  it("listMonumentTypes returns 20 entries (current catalog size)", () => {
    expect(listMonumentTypes().length).toBe(Object.keys(MONUMENTS).length);
  });

  it("allMonumentsPublic returns the full map", () => {
    const all = allMonumentsPublic();
    expect(Object.keys(all).length).toBe(Object.keys(MONUMENTS).length);
  });
});
