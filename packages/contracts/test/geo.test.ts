import { describe, expect, it } from "vitest";
import { distanceM, localFrame, metresPerDegree, worldMapPosition } from "../src/geo.ts";
import { CreateSessionBody, DisplayName, Pose } from "../src/index.ts";

const CHARMINAR = { lat: 17.36158, lon: 78.47466 };

describe("local frame", () => {
  it("round-trips lat/lon through local metres", () => {
    const f = localFrame(CHARMINAR);
    const p = { lat: 17.3626, lon: 78.4747 };
    const back = f.toLatLon(f.toLocal(p));
    expect(back.lat).toBeCloseTo(p.lat, 9);
    expect(back.lon).toBeCloseTo(p.lon, 9);
  });

  it("puts north at -z and east at +x", () => {
    const f = localFrame(CHARMINAR);
    expect(f.toLocal({ lat: CHARMINAR.lat + 0.001, lon: CHARMINAR.lon }).z).toBeLessThan(0);
    expect(f.toLocal({ lat: CHARMINAR.lat, lon: CHARMINAR.lon + 0.001 }).x).toBeGreaterThan(0);
  });

  // Haversine assumes a sphere; the local frame uses the WGS84 ellipsoid, so
  // they differ by the ellipsoid's flattening (~0.1–0.3%), not by error.
  it("agrees with spherical great-circle distance within 0.5% at district scale", () => {
    const f = localFrame(CHARMINAR);
    const p = { lat: 17.3662, lon: 78.4801 };
    const { x, z } = f.toLocal(p);
    const planar = Math.hypot(x, z);
    expect(Math.abs(planar - distanceM(CHARMINAR, p)) / planar).toBeLessThan(0.005);
  });

  it("has sane metres-per-degree", () => {
    expect(metresPerDegree(0).lon).toBeCloseTo(111_319, -1);
    expect(metresPerDegree(45).lat).toBeCloseTo(111_132, -1);
  });

  it("maps the world to 0..1", () => {
    expect(worldMapPosition({ lat: 0, lon: 0 })).toEqual({ x: 0.5, y: 0.5 });
    expect(worldMapPosition({ lat: 90, lon: -180 })).toEqual({ x: 0, y: 0 });
  });
});

describe("payload schemas", () => {
  it("accepts names in any script and rejects control/markup characters", () => {
    expect(DisplayName.parse("  Zara  ")).toBe("Zara");
    expect(DisplayName.safeParse("ज़ारा").success).toBe(true);
    expect(DisplayName.safeParse("فرح").success).toBe(true);
    expect(DisplayName.safeParse("<script>").success).toBe(false);
    expect(DisplayName.safeParse("a‮b").success).toBe(false);
    expect(DisplayName.safeParse("x".repeat(25)).success).toBe(false);
  });

  it("rejects unknown session fields", () => {
    expect(
      CreateSessionBody.safeParse({ name: "Zara", avatarId: "body-f-young", admin: true }).success,
    ).toBe(false);
  });

  it("bounds poses", () => {
    expect(Pose.safeParse({ x: 1, z: 2, heading: 0, anim: "walk" }).success).toBe(true);
    expect(Pose.safeParse({ x: Number.NaN, z: 2, heading: 0, anim: "walk" }).success).toBe(false);
    expect(Pose.safeParse({ x: 1e9, z: 2, heading: 0, anim: "walk" }).success).toBe(false);
    expect(Pose.safeParse({ x: 1, z: 2, heading: 0, anim: "fly" }).success).toBe(false);
  });
});
