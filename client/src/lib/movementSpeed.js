/**
 * Movement speed lookup — Phase 10H.
 *
 * Replaces the fixed `MOVEMENT_SPEED = 4` constant with a function that
 * factors in:
 *   • the avatar's vehicle (walk / cycle / auto / bike / car)
 *   • the surface under the avatar (main road / bike lane / sidewalk / off-road)
 *
 * The base unit is the same `4 world-units / second` that the previous
 * fixed value used — keeps walk-on-grass identical to today's experience
 * so this slice doesn't quietly break the path-animation timing on stock
 * walking. Vehicles + roads add multipliers on top.
 *
 * Surface multiplier table:
 *
 *                    main    bike    sidewalk    off-road
 *   walk             1.10    1.05    1.05        1.00
 *   cycle            1.20    1.30    1.00        0.90
 *   auto             1.20    1.00    0.95        0.85
 *   bike (motor)     1.25    1.10    0.90        0.80
 *   car              1.30    0.90    0.80        0.70
 *
 * Bike lane gives the cycle its biggest bonus (the in-fiction reason).
 * Cars take the biggest off-road penalty (you can drive on the lawn
 * but it's slower).
 *
 * Surface lookup is computed on the *server's* roadNetwork (shared
 * with `surfaceAt(cityId, [x, z])`), but we don't import server code on
 * the client — we mirror just the predicate using the city's
 * `roads.segments` already on the client via `mapAtom.roads`.
 */

const BASE_SPEED = 4; // world units / second — unchanged from pre-Phase-10H constant

const VEHICLE_MUL = {
  walk:  1.0,
  cycle: 1.8,
  auto:  2.3,
  bike:  3.0,
  car:   4.0,
};

const SURFACE_MUL = {
  walk:  { main: 1.10, bike: 1.05, sidewalk: 1.05, offroad: 1.00 },
  cycle: { main: 1.20, bike: 1.30, sidewalk: 1.00, offroad: 0.90 },
  auto:  { main: 1.20, bike: 1.00, sidewalk: 0.95, offroad: 0.85 },
  bike:  { main: 1.25, bike: 1.10, sidewalk: 0.90, offroad: 0.80 },
  car:   { main: 1.30, bike: 0.90, sidewalk: 0.80, offroad: 0.70 },
};

/**
 * Mirror of server `surfaceAt` — given the city's road segments + a
 * position, return the surface type the position sits on. Cheap enough
 * to call every frame on a single avatar (the path animator does).
 *
 * @param {Array<{a,b,width,type}>} segments — from map.roads.segments
 * @param {[number, number]} pos — grid coords (x, z)
 * @returns {"main"|"bike"|"sidewalk"|null}
 */
export const surfaceAtClient = (segments, pos) => {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  if (!Array.isArray(pos) || pos.length < 2) return null;
  const [x, z] = pos;
  const priorities = ["bike", "main", "sidewalk"];
  for (const wantType of priorities) {
    for (const s of segments) {
      if (s.type !== wantType) continue;
      const halfW = (s.width || 2) / 2;
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

/**
 * Compute the world-unit-per-second speed for a vehicle on a surface.
 * Off-road = surface lookup returned null.
 *
 * @param {string} [vehicleId="walk"]
 * @param {"main"|"bike"|"sidewalk"|null} [surface=null]
 * @returns {number}
 */
export const speedFor = (vehicleId = "walk", surface = null) => {
  const vMul = VEHICLE_MUL[vehicleId] ?? VEHICLE_MUL.walk;
  const surfaceTable = SURFACE_MUL[vehicleId] || SURFACE_MUL.walk;
  const surfaceKey = surface || "offroad";
  const sMul = surfaceTable[surfaceKey] ?? 1.0;
  return BASE_SPEED * vMul * sMul;
};

/** Used by ETAChip (slice 10I) to label the active surface bonus. */
export const surfaceLabel = (surface) => {
  if (surface === "main")     return "main road";
  if (surface === "bike")     return "bike lane";
  if (surface === "sidewalk") return "sidewalk";
  return "off-road";
};

export const BASE_MOVEMENT_SPEED = BASE_SPEED;
