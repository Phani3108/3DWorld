import { describe, it, expect } from "vitest";
import { roadsFor, surfaceAt, listRoadCityIds } from "../shared/roadNetwork.js";

describe("roadsFor — universal grid", () => {
  it("returns segments + intersections + crosswalks for every city", () => {
    for (const cityId of listRoadCityIds()) {
      const r = roadsFor(cityId);
      expect(Array.isArray(r.segments)).toBe(true);
      expect(r.segments.length).toBeGreaterThan(0);
      expect(Array.isArray(r.intersections)).toBe(true);
      expect(Array.isArray(r.crosswalks)).toBe(true);
    }
  });

  it("Hyderabad has main + bike + sidewalk segment types", () => {
    const r = roadsFor("hyderabad");
    const types = new Set(r.segments.map((s) => s.type));
    expect(types.has("main")).toBe(true);
    expect(types.has("bike")).toBe(true);
    expect(types.has("sidewalk")).toBe(true);
  });

  it("intersections are inside the 60×60 plot", () => {
    const r = roadsFor("hyderabad");
    for (const [x, z] of r.intersections) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(60);
      expect(z).toBeGreaterThanOrEqual(0);
      expect(z).toBeLessThanOrEqual(60);
    }
  });

  it("crosswalks emit one horizontal + one vertical at each intersection", () => {
    const r = roadsFor("hyderabad");
    expect(r.crosswalks.length).toBe(r.intersections.length * 2);
    const orients = r.crosswalks.map((c) => c.orient);
    expect(orients.filter((o) => o === "horizontal").length).toBe(r.intersections.length);
    expect(orients.filter((o) => o === "vertical").length).toBe(r.intersections.length);
  });

  it("returns fresh objects on each call (no shared mutation)", () => {
    const a = roadsFor("hyderabad");
    a.segments.push({ a: [0,0], b: [1,1], width: 1, type: "main" });
    const b = roadsFor("hyderabad");
    // Universal generator builds anew each call
    expect(b.segments.length).not.toBe(a.segments.length);
  });
});

describe("surfaceAt", () => {
  it("identifies the central horizontal main road", () => {
    expect(surfaceAt("hyderabad", [30, 30])).toBe("main");
    expect(surfaceAt("hyderabad", [40, 30])).toBe("main");
  });

  it("identifies the bike lane parallel to z=27", () => {
    expect(surfaceAt("hyderabad", [30, 27])).toBe("bike");
  });

  it("returns null off-road", () => {
    expect(surfaceAt("hyderabad", [15, 15])).toBeNull();
  });

  it("handles malformed input safely", () => {
    expect(surfaceAt("hyderabad", null)).toBeNull();
    expect(surfaceAt("hyderabad", [])).toBeNull();
    expect(surfaceAt(null, [10, 10])).toBeNull();
  });
});

describe("integrity", () => {
  it("every city has at least 9 main-road intersections", () => {
    for (const cityId of listRoadCityIds()) {
      const r = roadsFor(cityId);
      expect(r.intersections.length).toBeGreaterThanOrEqual(9);
    }
  });
});
