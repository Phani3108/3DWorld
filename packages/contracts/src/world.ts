import { z } from "zod";
import { LatLon } from "./geo.ts";

/**
 * Public projections of world content — what the server sends to clients.
 * Private content (persona prompts, curated answer banks) never leaves the server.
 */

export const Id = z
  .string()
  .max(64)
  .regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "expected a lowercase slug");
export type Id = z.infer<typeof Id>;

export const Source = z.strictObject({
  title: z.string().min(2).max(160),
  url: z.url({ protocol: /^https$/ }),
});
export type Source = z.infer<typeof Source>;

export const PublicFact = z.strictObject({
  text: z.string(),
  kind: z.enum(["fact", "flavour"]),
  status: z.enum(["verified", "unverified", "corrected"]),
  sources: z.array(Source),
});
export type PublicFact = z.infer<typeof PublicFact>;

export const Palette = z.strictObject({
  sky: z.string(),
  ground: z.string(),
  accent: z.string(),
});

export const PublicLanguage = z.strictObject({
  name: z.string(),
  script: z.string(),
  greetings: z.array(z.string()),
  farewells: z.array(z.string()),
  glossary: z.record(z.string(), z.string()),
});

export const PublicDistrict = z.strictObject({
  id: Id,
  cityId: Id,
  name: z.string(),
  blurb: z.string(),
  origin: LatLon,
  radiusM: z.number(),
  spawn: LatLon,
  /** Direction you face on arrival, degrees clockwise from north. Absent → face the origin. */
  spawnHeadingDeg: z.number().gte(0).lt(360).optional(),
  /** Compiled real-world geometry asset (roads, buildings). Absent → procedural stand-in. */
  geometry: z.string().optional(),
  attribution: z.array(z.string()),
});
export type PublicDistrict = z.infer<typeof PublicDistrict>;

export const PlaceKind = z.enum([
  "restaurant",
  "tea_stall",
  "cafe",
  "bar",
  "market",
  "majlis",
  "food_stall",
  "deli",
  "corner_store",
  "hawker_centre",
  "kopitiam",
  "chippery",
  "landmark",
  "park",
  "promenade",
]);
export type PlaceKind = z.infer<typeof PlaceKind>;

export const PublicPlace = z.strictObject({
  id: Id,
  cityId: Id,
  districtId: Id,
  kind: PlaceKind,
  name: z.string(),
  emoji: z.string(),
  blurb: z.string(),
  location: LatLon,
  /** Street-front spot (door) when the district has real map data. */
  frontage: z.strictObject({ location: LatLon, yawDeg: z.number() }).optional(),
  radiusM: z.number(),
  indoor: z.boolean(),
  hostId: Id.optional(),
  menu: z.array(Id),
  facts: z.array(PublicFact),
  greeting: z.string().optional(),
  seeds: z.array(z.string()),
});
export type PublicPlace = z.infer<typeof PublicPlace>;

export const Look = z.strictObject({
  /** Key into the avatar catalog (realistic rigged body). */
  avatarId: Id,
  presentation: z.enum(["feminine", "masculine", "neutral"]),
  ageBand: z.enum(["young-adult", "adult", "middle-aged", "senior"]),
  attire: z.string().max(160),
});
export type Look = z.infer<typeof Look>;

export const PublicResident = z.strictObject({
  id: Id,
  name: z.string(),
  cityId: Id,
  homePlaceId: Id,
  role: z.enum(["host", "regular"]),
  bio: z.string(),
  expertise: z.array(Id),
  look: Look,
});
export type PublicResident = z.infer<typeof PublicResident>;

export const PublicFood = z.strictObject({
  id: Id,
  cityId: Id,
  name: z.string(),
  emoji: z.string(),
  price: z.number().int().nonnegative(),
  description: z.string(),
});
export type PublicFood = z.infer<typeof PublicFood>;

export const PublicCity = z.strictObject({
  id: Id,
  name: z.string(),
  country: z.string(),
  countryCode: z.string().length(2),
  timezone: z.string(),
  emoji: z.string(),
  tagline: z.string(),
  palette: Palette,
  center: LatLon,
  greeterId: Id,
  defaultDistrictId: Id,
  districts: z.array(PublicDistrict),
  facts: z.array(PublicFact),
  language: PublicLanguage,
});
export type PublicCity = z.infer<typeof PublicCity>;

/** GET /v1/world — the whole map in one response (small; cached by the client). */
export const WorldSnapshot = z.strictObject({
  contentVersion: z.string(),
  cities: z.array(PublicCity),
});
export type WorldSnapshot = z.infer<typeof WorldSnapshot>;

/** GET /v1/cities/:cityId — everything needed to render a city's districts. */
export const CityDetail = z.strictObject({
  city: PublicCity,
  places: z.array(PublicPlace),
  residents: z.array(PublicResident),
  foods: z.array(PublicFood),
});
export type CityDetail = z.infer<typeof CityDetail>;
