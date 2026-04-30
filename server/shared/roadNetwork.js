/**
 * Road network — Phase 10A.
 *
 * Per-city road graph defining where asphalt + lane stripes + bike lanes
 * sit. Pure data; consumed by `<Roads>` on the client to render flat
 * extruded planes, and by pathfinding (future slice) for cost weighting.
 *
 * Coordinates are in **grid cells** (the same coordinate space as venue
 * footprints in venueCatalog.js). Each segment is a straight line from
 * `[a]` to `[b]` with a `width` (in cells) and a `type`:
 *
 *   "main"     — black-top road, dashed yellow centre line
 *   "bike"     — green bike lane, narrower
 *   "sidewalk" — light grey footpath, narrowest
 *
 * Segments are ordered draw-back-to-front so wider roads paint under
 * sidewalks and signal-eligible intersections come from the road graph.
 *
 * Phase 10A ships a universal grid that fits every city's 60 × 60 plot:
 *   • A ring at the edges (z=6, z=54, x=6, x=54)
 *   • A central cross (x=30 + z=30) — main arteries
 *   • A bike lane parallel to z=30 at z=27 (3-cell offset)
 *   • Sidewalks alongside the central cross
 *
 * Cities can override / extend by editing the `CITY_ROAD_OVERRIDES` map.
 */

const CELL = 1;

// Universal road grid applied to every 60×60 city.
const universalNetwork = () => {
  const segments = [];
  // Ring road
  segments.push({ a: [4, 6],  b: [56, 6],  width: 2.4, type: "main" });
  segments.push({ a: [4, 54], b: [56, 54], width: 2.4, type: "main" });
  segments.push({ a: [6, 4],  b: [6, 56],  width: 2.4, type: "main" });
  segments.push({ a: [54, 4], b: [54, 56], width: 2.4, type: "main" });
  // Central cross
  segments.push({ a: [4, 30],  b: [56, 30], width: 2.6, type: "main" });
  segments.push({ a: [30, 4],  b: [30, 56], width: 2.6, type: "main" });
  // Bike lane parallel to horizontal main, offset 3 cells north
  segments.push({ a: [8, 27],  b: [52, 27], width: 1.4, type: "bike" });
  // Sidewalks alongside the central horizontal main
  segments.push({ a: [4, 32],  b: [56, 32], width: 0.6, type: "sidewalk" });
  segments.push({ a: [4, 28],  b: [56, 28], width: 0.6, type: "sidewalk" });
  // Sidewalks alongside central vertical
  segments.push({ a: [32, 4],  b: [32, 56], width: 0.6, type: "sidewalk" });
  segments.push({ a: [28, 4],  b: [28, 56], width: 0.6, type: "sidewalk" });
  return segments;
};

/**
 * Per-city tweaks. Each entry is a function that takes the universal
 * network and returns a modified copy. Empty for now — placeholder for
 * future hand-tuning that prunes segments overlapping cherished
 * landmarks. The default behaviour ships the universal grid as-is.
 */
const CITY_ROAD_OVERRIDES = {
  // Example shape:
  // hyderabad: (segments) => segments.filter(s => !overlapsCharminar(s)),
};

/**
 * Compute the list of intersections — used by 10B (traffic signals)
 * and 10I (path visualisation). Returns unique grid cells where two or
 * more `main` road segments cross.
 */
const intersectionsFor = (segments) => {
  const mainSegs = segments.filter((s) => s.type === "main");
  const out = new Set();
  for (let i = 0; i < mainSegs.length; i++) {
    for (let j = i + 1; j < mainSegs.length; j++) {
      const A = mainSegs[i], B = mainSegs[j];
      const aHorz = A.a[1] === A.b[1];
      const bHorz = B.a[1] === B.b[1];
      // Only a horizontal × vertical pair can intersect on this grid.
      if (aHorz === bHorz) continue;
      const horz = aHorz ? A : B;
      const vert = aHorz ? B : A;
      const x = vert.a[0];
      const z = horz.a[1];
      // Inside both segments?
      const xMin = Math.min(horz.a[0], horz.b[0]);
      const xMax = Math.max(horz.a[0], horz.b[0]);
      const zMin = Math.min(vert.a[1], vert.b[1]);
      const zMax = Math.max(vert.a[1], vert.b[1]);
      if (x >= xMin && x <= xMax && z >= zMin && z <= zMax) {
        out.add(`${x}:${z}`);
      }
    }
  }
  return [...out].map((s) => {
    const [x, z] = s.split(":").map(Number);
    return [x, z];
  });
};

/**
 * @param {string} cityId
 * @returns {{ segments, intersections, crosswalks }}
 */
export const roadsFor = (cityId) => {
  const base = universalNetwork();
  const tweak = CITY_ROAD_OVERRIDES[cityId];
  const segments = tweak ? tweak(base) : base;
  const intersections = intersectionsFor(segments);
  // Crosswalks are placed across the road at every intersection — the
  // perpendicular line gives one crosswalk per side. Phase 10B reads
  // these to render zebra stripes.
  const crosswalks = intersections.flatMap(([x, z]) => [
    { at: [x, z], orient: "horizontal" },
    { at: [x, z], orient: "vertical" },
  ]);
  return { segments, intersections, crosswalks };
};

/**
 * Cheap "is this cell on a road?" lookup. Used by Phase 10H's vehicle
 * speed bonus on roads + bike lanes.
 *
 * @param {string} cityId
 * @param {[number, number]} pos — grid coords
 * @param {number} [tol=1.2] — half-width tolerance in cells
 * @returns {"main" | "bike" | "sidewalk" | null}
 */
export const surfaceAt = (cityId, pos, tol = 1.2) => {
  if (!Array.isArray(pos) || pos.length < 2) return null;
  const { segments } = roadsFor(cityId);
  const [x, z] = pos;
  // Order priority: bike > main > sidewalk so a player on the painted
  // bike lane gets the cycle bonus rather than the generic main bonus.
  const priorities = ["bike", "main", "sidewalk"];
  for (const wantType of priorities) {
    for (const s of segments) {
      if (s.type !== wantType) continue;
      const halfW = (s.width || 2) / 2 + tol * 0;
      const minX = Math.min(s.a[0], s.b[0]);
      const maxX = Math.max(s.a[0], s.b[0]);
      const minZ = Math.min(s.a[1], s.b[1]);
      const maxZ = Math.max(s.a[1], s.b[1]);
      const horz = s.a[1] === s.b[1];
      if (horz) {
        if (z >= s.a[1] - halfW && z <= s.a[1] + halfW && x >= minX && x <= maxX) return wantType;
      } else {
        if (x >= s.a[0] - halfW && x <= s.a[0] + halfW && z >= minZ && z <= maxZ) return wantType;
      }
    }
  }
  return null;
};

export const listRoadCityIds = () => {
  // The universal network applies to every city in cityCatalog. The list
  // here is used by tests + admin UIs.
  return ["hyderabad", "dubai", "bengaluru", "mumbai", "newyork", "singapore", "sydney"];
};
