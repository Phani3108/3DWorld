import { distanceM, Emote } from "@3dworld/contracts";
import type { World } from "./index.ts";

export type ValidationReport = {
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
};

/** Cross-reference checks the schema alone can't express. */
export const validateWorld = (world: World): ValidationReport => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tags = new Set(world.expertise.map((t) => t.id));
  const avatars = new Set(world.avatars.map((a) => a.id));
  const emotes = new Set<string>(Emote.options);

  const ids = new Map<string, string>();
  const claim = (id: string, kind: string) => {
    const prior = ids.get(id);
    if (prior) errors.push(`id "${id}" is used by both a ${prior} and a ${kind}`);
    else ids.set(id, kind);
  };
  for (const id of world.cities.keys()) claim(id, "city");
  for (const id of world.districts.keys()) claim(id, "district");
  for (const id of world.places.keys()) claim(id, "place");
  for (const id of world.residents.keys()) claim(id, "resident");
  for (const id of world.foods.keys()) claim(id, "food");
  for (const id of world.events.keys()) claim(id, "event");

  for (const city of world.cities.values()) {
    const greeter = world.residents.get(city.greeterId);
    if (!greeter || greeter.cityId !== city.id)
      errors.push(`${city.id}: greeter "${city.greeterId}" is not a resident of the city`);
    const home = world.districts.get(city.defaultDistrictId);
    if (!home || home.cityId !== city.id)
      errors.push(`${city.id}: default district "${city.defaultDistrictId}" is not in the city`);
    for (const e of city.emotes)
      if (!emotes.has(e)) errors.push(`${city.id}: unknown emote "${e}"`);
  }

  for (const d of world.districts.values()) {
    const off = distanceM(d.origin, d.spawn);
    if (off > d.radiusM)
      errors.push(`${d.id}: spawn is ${Math.round(off)} m from origin (radius ${d.radiusM} m)`);
  }

  for (const p of world.places.values()) {
    const d = world.districts.get(p.districtId);
    if (!d || d.cityId !== p.cityId) {
      errors.push(`${p.id}: district "${p.districtId}" is not in ${p.cityId}`);
    } else {
      const off = distanceM(d.origin, p.location);
      if (off > d.radiusM)
        errors.push(`${p.id}: ${Math.round(off)} m from ${d.id} origin (radius ${d.radiusM} m)`);
    }
    if (p.hostId) {
      const host = world.residents.get(p.hostId);
      if (!host || host.cityId !== p.cityId)
        errors.push(`${p.id}: host "${p.hostId}" is not a resident of ${p.cityId}`);
      else if (host.role !== "host" || host.homePlaceId !== p.id)
        errors.push(`${p.id}: "${p.hostId}" must be a host whose home is this place`);
    }
    if (p.conversation && !p.hostId) errors.push(`${p.id}: has a conversation bank but no host`);
    for (const f of p.menu) {
      const food = world.foods.get(f);
      if (!food || food.cityId !== p.cityId)
        errors.push(`${p.id}: menu item "${f}" is not a ${p.cityId} food`);
    }
    if (p.likeness === "real-business") {
      warnings.push(
        p.placement === "relocated"
          ? `${p.id}: real business "${p.name}" is relocated into ${p.districtId} and staffed by invented residents — fictionalise or move (naming decision)`
          : `${p.id}: real business "${p.name}" is staffed by invented residents — fictionalise (naming decision)`,
      );
    }
  }

  for (const r of world.residents.values()) {
    const home = world.places.get(r.homePlaceId);
    if (!home || home.cityId !== r.cityId)
      errors.push(`${r.id}: home "${r.homePlaceId}" is not a ${r.cityId} place`);
    for (const t of r.expertise)
      if (!tags.has(t)) errors.push(`${r.id}: unknown expertise tag "${t}"`);
    if (!avatars.has(r.look.avatarId)) errors.push(`${r.id}: unknown avatar "${r.look.avatarId}"`);
    if (r.role === "host" && !r.persona) warnings.push(`${r.id}: host has no persona`);
  }

  for (const e of world.events.values()) {
    const p = world.places.get(e.placeId);
    if (!p || p.cityId !== e.cityId)
      errors.push(`${e.id}: place "${e.placeId}" is not in ${e.cityId}`);
  }

  const facts = [...world.cities.values()]
    .flatMap((c) => c.facts)
    .concat([...world.places.values()].flatMap((p) => p.facts));
  const count = (pred: (f: (typeof facts)[number]) => boolean) => facts.filter(pred).length;
  const places = [...world.places.values()];
  return {
    errors,
    warnings,
    stats: {
      cities: world.cities.size,
      districts: world.districts.size,
      places: world.places.size,
      residents: world.residents.size,
      foods: world.foods.size,
      events: world.events.size,
      facts: count((f) => f.kind === "fact"),
      factsVerified: count((f) => f.kind === "fact" && f.status === "verified"),
      factsCorrected: count((f) => f.status === "corrected"),
      factsWithSources: count((f) => f.sources.length > 0),
      placesApproximate: places.filter((p) => p.placement === "approximate").length,
      placesRelocated: places.filter((p) => p.placement === "relocated").length,
      cannedAnswers:
        places.reduce((n, p) => n + (p.conversation?.canned.length ?? 0), 0) +
        [...world.residents.values()].reduce((n, r) => n + r.canned.length, 0),
    },
  };
};
