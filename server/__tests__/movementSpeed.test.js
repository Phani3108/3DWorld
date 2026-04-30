// Phase 10H — pure-JS movement speed lookup. The implementation lives
// under client/src/lib/movementSpeed.js (used at run-time by the avatar
// path animator). This server-side test imports it directly via a
// relative path; vitest doesn't care where the module lives so long as
// the import resolves on disk.

import { describe, it, expect } from "vitest";
import {
  speedFor,
  surfaceAtClient,
  surfaceLabel,
  BASE_MOVEMENT_SPEED,
} from "../../client/src/lib/movementSpeed.js";

describe("speedFor", () => {
  it("walking off-road matches the pre-Phase-10H constant", () => {
    expect(speedFor("walk", null)).toBe(BASE_MOVEMENT_SPEED * 1.0 * 1.0);
  });

  it("car on a main road is faster than off-road and ~5× walk", () => {
    const carRoad = speedFor("car", "main");
    const carOff  = speedFor("car", null);
    expect(carRoad).toBeGreaterThan(carOff);
    expect(carRoad / speedFor("walk", null)).toBeGreaterThan(5);
  });

  it("cycle is fastest on a bike lane (best surface bonus)", () => {
    const lane = speedFor("cycle", "bike");
    const main = speedFor("cycle", "main");
    const off  = speedFor("cycle", null);
    expect(lane).toBeGreaterThan(main);
    expect(main).toBeGreaterThan(off);
  });

  it("car penalised most off-road relative to its road bonus", () => {
    const carRatio  = speedFor("car",  "main") / speedFor("car",  null);
    const walkRatio = speedFor("walk", "main") / speedFor("walk", null);
    expect(carRatio).toBeGreaterThan(walkRatio);
  });

  it("unknown vehicle defaults to walk multiplier", () => {
    expect(speedFor("rocket-bike", null)).toBe(speedFor("walk", null));
  });
});

describe("surfaceAtClient", () => {
  const segs = [
    { a: [0, 30], b: [60, 30], width: 2,   type: "main" },
    { a: [0, 27], b: [60, 27], width: 1.4, type: "bike" },
    { a: [30, 0], b: [30, 60], width: 2,   type: "main" },
  ];

  it("identifies the horizontal main road at z=30", () => {
    expect(surfaceAtClient(segs, [10, 30])).toBe("main");
  });
  it("bike lane at z=27 wins priority over main", () => {
    expect(surfaceAtClient(segs, [10, 27])).toBe("bike");
  });
  it("off-road points return null", () => {
    expect(surfaceAtClient(segs, [5, 5])).toBeNull();
  });
  it("malformed inputs are safe", () => {
    expect(surfaceAtClient(null, [1, 1])).toBeNull();
    expect(surfaceAtClient([], [1, 1])).toBeNull();
    expect(surfaceAtClient(segs, null)).toBeNull();
  });
});

describe("surfaceLabel", () => {
  it("returns human strings", () => {
    expect(surfaceLabel("main")).toBe("main road");
    expect(surfaceLabel("bike")).toBe("bike lane");
    expect(surfaceLabel("sidewalk")).toBe("sidewalk");
    expect(surfaceLabel(null)).toBe("off-road");
  });
});
