import { describe, expect, it } from "vitest";
import {
  CITY_FILES,
  cityDetail,
  loadWorld,
  matchBank,
  tokenize,
  validateWorld,
  worldSnapshot,
} from "../src/index.ts";

const world = loadWorld();
const place = (id: string) => world.places.get(id)!;
const resident = (id: string) => world.residents.get(id)!;
const ask = (placeId: string, q: string) => matchBank(place(placeId).conversation?.canned ?? [], q);

describe("world content", () => {
  it("loads all seven cities with zero validation errors", () => {
    const report = validateWorld(world);
    expect(report.errors).toEqual([]);
    expect(report.stats).toMatchObject({ cities: 7, places: 21, residents: 28 });
  });

  it("uses fictional venues, not real businesses staffed by invented residents", () => {
    const real = [...world.places.values()].filter((p) => p.likeness === "real-business");
    expect(real.map((p) => p.name)).toEqual([]);
    expect(validateWorld(world).warnings).toEqual([]);
  });

  it("rejects duplicate ids and schema errors", () => {
    const [hyderabad] = CITY_FILES;
    expect(() => loadWorld([hyderabad!, hyderabad!])).toThrow(/duplicate city id "hyderabad"/);
    expect(() => loadWorld([{ ...hyderabad!, residents: [] }])).not.toThrow();
    expect(() => loadWorld([{ ...hyderabad!, districts: [] }])).toThrow(
      /schema errors in hyderabad/,
    );
  });

  it("gives the content a stable version hash", () => {
    expect(loadWorld().version).toBe(world.version);
    expect(world.version).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe("public projections", () => {
  it("never leak personas or curated answer banks", () => {
    const json = JSON.stringify([
      worldSnapshot(world),
      ...[...world.cities.keys()].map((c) => cityDetail(world, c)),
    ]);
    expect(json).not.toMatch(/"persona"|"canned"|"keywords"|"style"|"filler"/);
    for (const r of world.residents.values())
      if (r.persona) expect(json).not.toContain(r.persona.slice(0, 40));
  });

  it("returns null for unknown cities", () => {
    expect(cityDetail(world, "atlantis")).toBeNull();
    expect(cityDetail(world, "__proto__")).toBeNull();
  });
});

describe("curated-bank matcher", () => {
  it.each([
    ["blr_namma_tiffin_mane", "What city is this?"],
    ["nyc_bodega", "Who won the 1997 World Series?"],
    ["syd_bondi_chippery", "I understand. Thanks!"],
    ["hyd_gulzar_irani_cafe", "Who is the current Nizam?"],
    ["hyd_shahi_handi", "How is the weather today?"],
    ["blr_namma_tiffin_mane", "how long does dum take?"],
  ])("%s: %j → no match", (placeId, q) => {
    expect(ask(placeId, q)).toBeNull();
  });

  it("still finds the right answer for real questions", () => {
    expect(ask("hyd_shahi_handi", "tell me about dum cooking")?.answer).toMatch(/sealed pot/);
    expect(ask("blr_namma_tiffin_mane", "what makes the filter coffee special?")?.answer).toMatch(
      /Tumbler/,
    );
    expect(matchBank(resident("zara_hyd").canned, "how long does dum take?")?.answer).toMatch(
      /Thirty-five minutes/,
    );
  });

  it("matches phrases as whole words and simple word forms", () => {
    const bank = [
      { keywords: ["how long"], answer: "Answer A." },
      { keywords: ["cook"], answer: "Answer B." },
    ];
    expect(matchBank(bank, "How long is the queue?")?.answer).toBe("Answer A.");
    expect(matchBank(bank, "Who is cooking tonight?")?.answer).toBe("Answer B.");
    expect(matchBank(bank, "How do you do?")).toBeNull();
  });

  it("tokenizes accents and non-Latin scripts", () => {
    expect(tokenize("Café Gulzar — chai?")).toEqual(["cafe", "gulzar", "chai"]);
    expect(tokenize("हैदराबादी biryani")).toEqual(["हैदराबादी", "biryani"]);
    expect(tokenize("مرحبا habibi")).toEqual(["مرحبا", "habibi"]);
  });
});
