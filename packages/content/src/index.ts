import { createHash } from "node:crypto";
import type {
  CityDetail,
  PublicCity,
  PublicDistrict,
  PublicFact,
  PublicFood,
  PublicPlace,
  PublicResident,
  WorldSnapshot,
} from "@3dworld/contracts";
import { AVATARS } from "./avatars.ts";
import bengaluru from "./cities/bengaluru.ts";
import dubai from "./cities/dubai.ts";
import hyderabad from "./cities/hyderabad.ts";
import mumbai from "./cities/mumbai.ts";
import newyork from "./cities/newyork.ts";
import singapore from "./cities/singapore.ts";
import sydney from "./cities/sydney.ts";
import { EXPERTISE } from "./expertise.ts";
import {
  type City,
  CityBundle,
  type CityBundleInput,
  type CityEvent,
  type District,
  type Fact,
  type Food,
  type Place,
  type Resident,
} from "./schema.ts";

export { AVATARS, DEFAULT_AVATAR_ID } from "./avatars.ts";
export { matchBank, tokenize } from "./canned.ts";
export { EXPERTISE } from "./expertise.ts";
export * from "./schema.ts";
export { validateWorld } from "./validate.ts";

export const CITY_FILES: CityBundleInput[] = [
  hyderabad,
  dubai,
  bengaluru,
  mumbai,
  newyork,
  singapore,
  sydney,
];

type InCity<T> = T & { cityId: string };

export type World = {
  version: string;
  cities: Map<string, City>;
  districts: Map<string, InCity<District>>;
  places: Map<string, InCity<Place>>;
  residents: Map<string, InCity<Resident>>;
  foods: Map<string, InCity<Food>>;
  events: Map<string, InCity<CityEvent>>;
  expertise: typeof EXPERTISE;
  avatars: typeof AVATARS;
};

const put = <T extends { id: string }>(map: Map<string, T>, value: T, kind: string) => {
  if (map.has(value.id)) throw new Error(`duplicate ${kind} id "${value.id}"`);
  map.set(value.id, value);
};

/** Parse + index every city file. Throws on schema errors or duplicate ids. */
export const loadWorld = (files: CityBundleInput[] = CITY_FILES): World => {
  const world: World = {
    version: "",
    cities: new Map(),
    districts: new Map(),
    places: new Map(),
    residents: new Map(),
    foods: new Map(),
    events: new Map(),
    expertise: EXPERTISE,
    avatars: AVATARS,
  };
  const hash = createHash("sha256");
  for (const file of files) {
    const parsed = CityBundle.safeParse(file);
    if (!parsed.success) {
      const where = (file as { city?: { id?: string } }).city?.id ?? "unknown city";
      const issues = parsed.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`content schema errors in ${where}:\n${issues}`);
    }
    const b = parsed.data;
    const cityId = b.city.id;
    put(world.cities, b.city, "city");
    for (const d of b.districts) put(world.districts, { ...d, cityId }, "district");
    for (const p of b.places) put(world.places, { ...p, cityId }, "place");
    for (const r of b.residents) put(world.residents, { ...r, cityId }, "resident");
    for (const f of b.foods) put(world.foods, { ...f, cityId }, "food");
    for (const e of b.events) put(world.events, { ...e, cityId }, "event");
    hash.update(JSON.stringify(b));
  }
  world.version = hash.digest("hex").slice(0, 12);
  return world;
};

// ── Public projections (safe for browsers) ─────────────────────────

const publicFact = (f: Fact): PublicFact => ({
  text: f.text,
  kind: f.kind,
  status: f.status,
  sources: f.sources,
});

const publicDistrict = (d: InCity<District>): PublicDistrict => ({
  id: d.id,
  cityId: d.cityId,
  name: d.name,
  blurb: d.blurb,
  origin: d.origin,
  radiusM: d.radiusM,
  spawn: d.spawn,
  ...(d.spawnHeadingDeg !== undefined ? { spawnHeadingDeg: d.spawnHeadingDeg } : {}),
  ...(d.geometry ? { geometry: d.geometry } : {}),
  attribution: d.attribution,
});

export const publicCity = (world: World, city: City): PublicCity => ({
  id: city.id,
  name: city.name,
  country: city.country,
  countryCode: city.countryCode,
  timezone: city.timezone,
  emoji: city.emoji,
  tagline: city.tagline,
  palette: city.palette,
  center: city.center,
  greeterId: city.greeterId,
  defaultDistrictId: city.defaultDistrictId,
  districts: [...world.districts.values()].filter((d) => d.cityId === city.id).map(publicDistrict),
  facts: city.facts.map(publicFact),
  language: {
    name: city.language.name,
    script: city.language.script,
    greetings: city.language.greetings,
    farewells: city.language.farewells,
    glossary: city.language.glossary,
  },
});

export const publicPlace = (p: InCity<Place>): PublicPlace => ({
  id: p.id,
  cityId: p.cityId,
  districtId: p.districtId,
  kind: p.kind,
  name: p.name,
  emoji: p.emoji,
  blurb: p.blurb,
  location: p.location,
  ...(p.frontage ? { frontage: p.frontage } : {}),
  radiusM: p.radiusM,
  indoor: p.ambience.indoor,
  ...(p.hostId ? { hostId: p.hostId } : {}),
  menu: p.menu,
  facts: p.facts.map(publicFact),
  ...(p.conversation ? { greeting: p.conversation.greeting } : {}),
  seeds: p.conversation?.seeds ?? [],
});

export const publicResident = (r: InCity<Resident>): PublicResident => ({
  id: r.id,
  name: r.name,
  cityId: r.cityId,
  homePlaceId: r.homePlaceId,
  role: r.role,
  bio: r.bio,
  expertise: r.expertise,
  look: r.look,
});

export const publicFood = (f: InCity<Food>): PublicFood => ({
  id: f.id,
  cityId: f.cityId,
  name: f.name,
  emoji: f.emoji,
  price: f.price,
  description: f.description,
});

export const worldSnapshot = (world: World): WorldSnapshot => ({
  contentVersion: world.version,
  cities: [...world.cities.values()].map((c) => publicCity(world, c)),
});

export const cityDetail = (world: World, cityId: string): CityDetail | null => {
  const city = world.cities.get(cityId);
  if (!city) return null;
  const inCity = <T extends { cityId: string }>(m: Map<string, T>) =>
    [...m.values()].filter((v) => v.cityId === cityId);
  return {
    city: publicCity(world, city),
    places: inCity(world.places).map(publicPlace),
    residents: inCity(world.residents).map(publicResident),
    foods: inCity(world.foods).map(publicFood),
  };
};
