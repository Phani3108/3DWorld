import { z } from "zod";
import { LatLon } from "./geo.ts";

/**
 * Compiled district geometry (apps/web/public/geo/<id>.json), produced from
 * OpenStreetMap by packages/content/scripts/osm-compile.ts. Coordinates are
 * flat [x0, z0, x1, z1, …] arrays in the district's local frame (metres,
 * x east, z south), rounded to 0.1 m.
 */

const Flat = z.array(z.number());

export const RoadKind = z.enum([
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "residential",
  "living_street",
  "service",
  "unclassified",
  "pedestrian",
  "footway",
  "path",
  "steps",
]);
export type RoadKind = z.infer<typeof RoadKind>;

export const DistrictGeometry = z.strictObject({
  version: z.literal(1),
  districtId: z.string(),
  origin: LatLon,
  bounds: z.strictObject({
    minX: z.number(),
    minZ: z.number(),
    maxX: z.number(),
    maxZ: z.number(),
  }),
  attribution: z.string(),
  source: z.strictObject({ license: z.string(), snapshot: z.string(), url: z.string() }),
  roads: z.array(
    z.strictObject({ kind: RoadKind, width: z.number(), pts: Flat, name: z.string().optional() }),
  ),
  areas: z.array(
    z.strictObject({
      kind: z.enum(["plaza", "park", "water", "parking", "beach", "land"]),
      ring: Flat,
    }),
  ),
  buildings: z.array(
    z.strictObject({
      id: z.number(),
      ring: Flat,
      /** Top of the walls, metres above ground. */
      h: z.number(),
      /** Bottom of the walls (gateways and canopies float above the street). */
      minH: z.number().optional(),
      /** True when height was estimated (OSM had no height or levels). */
      est: z.boolean().optional(),
      /** Not in OSM: a generated street-front lot filling an unmapped block edge. */
      infill: z.boolean().optional(),
      name: z.string().optional(),
      /** Render a hand-built model here instead of an extrusion. */
      landmark: z.string().optional(),
    }),
  ),
  trees: Flat,
  pois: z.array(
    z.strictObject({ kind: z.string(), x: z.number(), z: z.number(), name: z.string().optional() }),
  ),
  /** Street-front spots for venues: centre of the frontage and the yaw that faces the street. */
  venues: z.array(
    z.strictObject({ placeId: z.string(), x: z.number(), z: z.number(), yaw: z.number() }),
  ),
});
export type DistrictGeometry = z.infer<typeof DistrictGeometry>;
