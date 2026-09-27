import { Id, LatLon, Look, Palette, PlaceKind, Source } from "@3dworld/contracts";
import { z } from "zod";

/**
 * Authoring schema for world content. One file per city under src/cities/.
 * Everything here is server-side: persona prompts and curated answer banks
 * never reach the browser (see project.ts for the public projections).
 */

export const isTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const Fact = z.strictObject({
  text: z.string().min(10).max(320),
  /** "flavour" = voice/colour, never cited as fact in the Codex. */
  kind: z.enum(["fact", "flavour"]).default("fact"),
  /** "corrected" = rewritten from a legacy claim that was wrong or overstated (see note). */
  status: z.enum(["verified", "unverified", "corrected"]).default("unverified"),
  sources: z.array(Source).default([]),
  note: z.string().max(400).optional(),
});
export type FactInput = z.input<typeof Fact>;

export const CannedAnswer = z.strictObject({
  keywords: z.array(z.string().min(1)).min(1),
  answer: z.string().min(10).max(900),
});
export type CannedAnswer = z.infer<typeof CannedAnswer>;

export const Language = z.strictObject({
  name: z.string(),
  script: z.string(),
  greetings: z.array(z.string()).min(1),
  filler: z.array(z.string()),
  farewells: z.array(z.string()).min(1),
  glossary: z.record(z.string(), z.string()),
  /** How residents of this city speak (fed to the Resident Brain). */
  style: z.string().min(20),
});

export const District = z.strictObject({
  id: Id,
  name: z.string(),
  blurb: z.string().max(200),
  /** Local-frame origin: x east, z south, metres. */
  origin: LatLon,
  radiusM: z.number().min(100).max(3000),
  spawn: LatLon,
  geometry: z.string().optional(),
  attribution: z.array(z.string()).default([]),
});

export const Ambience = z.strictObject({
  music: z.string().optional(),
  musicCredit: z.string().optional(),
  crossfadeMs: z.number().int().min(0).max(10_000),
  cityVolumeDuck: z.number().min(0).max(1),
  indoor: z.boolean(),
});

export const Place = z.strictObject({
  id: Id,
  districtId: Id,
  kind: PlaceKind,
  name: z.string(),
  emoji: z.string(),
  blurb: z.string().max(200),
  /**
   * public-landmark: a public place (monument, park, market street).
   * generic: an invented business type ("a kopitiam").
   * real-business: a named, privately owned business. Residents there are
   *   invented, which is a likeness risk; see the naming decision in the plan.
   */
  likeness: z.enum(["public-landmark", "generic", "real-business"]),
  location: LatLon,
  /** real = surveyed location; approximate = within ~100 m; relocated = placed in this district for play, not where it really is. */
  placement: z.enum(["real", "approximate", "relocated"]),
  radiusM: z.number().positive().max(200),
  hostId: Id.optional(),
  menu: z.array(Id).default([]),
  facts: z.array(Fact).default([]),
  conversation: z
    .strictObject({
      greeting: z.string(),
      seeds: z.array(z.string()).max(8),
      register: z.string(),
      canned: z.array(CannedAnswer),
    })
    .optional(),
  ambience: Ambience,
});

export const Resident = z.strictObject({
  id: Id,
  name: z.string(),
  homePlaceId: Id,
  role: z.enum(["host", "regular"]),
  bio: z.string().max(200),
  /** Voice & manner for the Resident Brain (hosts carry the venue's voice). */
  persona: z.string().optional(),
  expertise: z.array(Id),
  routine: z.enum([
    "host",
    "chat_stall",
    "market",
    "majlis",
    "pub",
    "street_vendor",
    "hawker",
    "barista",
    "wander",
  ]),
  lines: z.array(z.string()).min(1),
  canned: z.array(CannedAnswer).default([]),
  look: Look,
});

export const Food = z.strictObject({
  id: Id,
  name: z.string(),
  emoji: z.string(),
  price: z.number().int().nonnegative(),
  description: z.string().max(200),
});

export const CityEvent = z.strictObject({
  id: Id,
  placeId: Id,
  title: z.string(),
  blurb: z.string(),
  emoji: z.string(),
  /** Weekly slot in the city's local time. dayOfWeek 0 = Sunday. */
  schedule: z.strictObject({
    dayOfWeek: z.number().int().min(0).max(6),
    startHour: z.number().int().min(0).max(23),
    durationHours: z.number().int().min(1).max(12),
  }),
});

export const City = z.strictObject({
  id: Id,
  name: z.string(),
  country: z.string(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  timezone: z.string().refine(isTimeZone, "unknown IANA time zone"),
  emoji: z.string(),
  tagline: z.string().max(120),
  palette: Palette,
  center: LatLon,
  greeterId: Id,
  defaultDistrictId: Id,
  emotes: z.array(Id),
  facts: z.array(Fact).default([]),
  language: Language,
});

/** One city's complete content bundle. */
export const CityBundle = z.strictObject({
  city: City,
  districts: z.array(District).min(1),
  places: z.array(Place),
  residents: z.array(Resident),
  foods: z.array(Food),
  events: z.array(CityEvent).default([]),
});
export type CityBundleInput = z.input<typeof CityBundle>;
export type CityBundle = z.infer<typeof CityBundle>;

export type City = z.infer<typeof City>;
export type District = z.infer<typeof District>;
export type Place = z.infer<typeof Place>;
export type Resident = z.infer<typeof Resident>;
export type Food = z.infer<typeof Food>;
export type CityEvent = z.infer<typeof CityEvent>;
export type Fact = z.infer<typeof Fact>;

export const ExpertiseGroup = z.enum([
  "cuisine",
  "drink",
  "language",
  "culture",
  "skill",
  "sport",
  "music",
]);
export const ExpertiseTag = z.strictObject({
  id: Id,
  label: z.string(),
  emoji: z.string(),
  group: ExpertiseGroup,
});
export type ExpertiseTag = z.infer<typeof ExpertiseTag>;

/** Identity helper that type-checks a city file against the schema's input type. */
export const defineCity = (bundle: CityBundleInput) => bundle;
