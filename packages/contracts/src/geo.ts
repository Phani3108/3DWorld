import { z } from "zod";

/**
 * Real-world coordinates (WGS84) and the local metric frame the 3D scene uses.
 *
 * Local frame per district, origin = district.origin:
 *   x = metres east, z = metres south (so north is -z, "into the screen" in three.js),
 *   y = up. Heading 0 faces north (-z) and grows clockwise (east = π/2).
 *
 * Districts are ≤ a few km across, so a tangent-plane projection using the
 * ellipsoid's radii of curvature at the origin is accurate to centimetres.
 */

export const LatLon = z.strictObject({
  lat: z.number().gte(-90).lte(90),
  lon: z.number().gte(-180).lte(180),
});
export type LatLon = z.infer<typeof LatLon>;

export type LocalPoint = { x: number; z: number };

const WGS84_A = 6_378_137;
const WGS84_E2 = 6.694_379_990_14e-3;
const DEG = Math.PI / 180;

/** Metres per degree of latitude/longitude at a given latitude. */
export const metresPerDegree = (latDeg: number) => {
  const phi = latDeg * DEG;
  const s = Math.sin(phi);
  const w = 1 - WGS84_E2 * s * s;
  const meridional = (WGS84_A * (1 - WGS84_E2)) / (w * Math.sqrt(w));
  const primeVertical = WGS84_A / Math.sqrt(w);
  return { lat: meridional * DEG, lon: primeVertical * Math.cos(phi) * DEG };
};

/** Build a projector for one district origin. */
export const localFrame = (origin: LatLon) => {
  const k = metresPerDegree(origin.lat);
  return {
    toLocal: (p: LatLon): LocalPoint => ({
      x: (p.lon - origin.lon) * k.lon,
      z: -(p.lat - origin.lat) * k.lat,
    }),
    toLatLon: (p: LocalPoint): LatLon => ({
      lat: origin.lat - p.z / k.lat,
      lon: origin.lon + p.x / k.lon,
    }),
  };
};

/** Great-circle distance in metres (haversine, mean Earth radius). */
export const distanceM = (a: LatLon, b: LatLon) => {
  const R = 6_371_008.8;
  const dLat = (b.lat - a.lat) * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** Equirectangular position on a world map, both axes in 0..1 (x east, y south). */
export const worldMapPosition = (p: LatLon) => ({ x: (p.lon + 180) / 360, y: (90 - p.lat) / 180 });
