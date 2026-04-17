/**
 * venueService — lightweight "which venue is this character inside?" helper.
 *
 * Venue detection is data-driven: each venue has a footprint (grid bounds)
 * and a radius. A character at grid (x,y) is considered inside a venue if
 * (x,y) falls within [footprint.x .. x+w] × [footprint.z .. z+d], expanded
 * by `radius`. When two venues overlap (shouldn't happen with our catalog),
 * the nearest center wins.
 */

import { VENUES } from "./shared/venueCatalog.js";

/**
 * @param {string|null} cityId
 * @param {[number, number]} gridPos  — [gridX, gridY] from character.position
 * @returns {string|null} venue id the character is inside, or null
 */
export const findVenueAt = (cityId, gridPos) => {
  if (!cityId || !Array.isArray(gridPos)) return null;
  const [x, z] = gridPos;
  if (typeof x !== "number" || typeof z !== "number") return null;

  let best = null;
  let bestDist = Infinity;

  for (const v of Object.values(VENUES)) {
    if (v.cityId !== cityId) continue;
    if (!v.footprint) continue;
    const { x: fx, z: fz, w, d } = v.footprint;
    const r = typeof v.radius === "number" ? v.radius : 3;
    // Footprint is in "city grid cells" — the player position is too. Each
    // grid cell equals one integer unit; gridDivision is already baked in.
    // Expand the footprint by `r` cells on all sides.
    const minX = fx - r;
    const maxX = fx + w + r;
    const minZ = fz - r;
    const maxZ = fz + d + r;
    if (x < minX || x > maxX || z < minZ || z > maxZ) continue;

    // Distance to centre (tie-break)
    const cx = fx + w / 2;
    const cz = fz + d / 2;
    const dx = x - cx;
    const dz = z - cz;
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      best = v.id;
    }
  }

  return best;
};

/**
 * Derive the cityId from a roomId. City rooms follow the convention
 * `city_<cityId>` (see server/index.js:seedCityRooms).
 */
export const cityIdFromRoom = (roomId) => {
  if (typeof roomId !== "string") return null;
  if (roomId.startsWith("city_")) return roomId.slice("city_".length);
  return null;
};
