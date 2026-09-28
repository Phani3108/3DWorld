import type { Look } from "@3dworld/contracts";

/** Deterministic 32-bit hash → [0, 1). */
export const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100_000) / 100_000;
};

/** Seeded PRNG (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const SKIN = ["#f3d5c0", "#e9bf9f", "#d7a07a", "#bb835c", "#9a6442", "#77482e", "#51301f"];
/** Regional ranges keep the stand-in cast plausible for each city. */
const SKIN_RANGE: Record<string, [number, number]> = {
  hyderabad: [2, 5],
  bengaluru: [2, 6],
  mumbai: [2, 5],
  dubai: [1, 4],
  singapore: [0, 4],
  newyork: [0, 6],
  sydney: [0, 5],
};

const ATTIRE_COLOURS: Array<[RegExp, string]> = [
  [/black/, "#1f1f24"],
  [/white|whites/, "#e9e6df"],
  [/khaki/, "#a8956a"],
  [/beige/, "#cdb993"],
  [/denim/, "#3d5a80"],
  [/checked/, "#5f7394"],
  [/grey|gray/, "#7d828c"],
  [/sari|saree/, "#9e2f5b"],
  [/salwar|kurta/, "#2f6f73"],
  [/hoodie/, "#44475a"],
  [/linen/, "#d8cfbf"],
  [/wetsuit/, "#16181c"],
  [/singlet/, "#f2f2f2"],
];
const FALLBACK_TOPS = ["#6d4c41", "#34495e", "#7b3f61", "#2e7d6b", "#8d6e3f", "#4b5d7a"];

export type Build = {
  height: number;
  shoulders: number;
  hips: number;
  skin: string;
  hair: string;
  hairLong: boolean;
  top: string;
  bottom: string;
  shoes: string;
  stoop: number;
  pace: number;
};

export const buildFor = (
  id: string,
  look: Pick<Look, "presentation" | "ageBand" | "attire">,
  cityId?: string,
): Build => {
  const r = rng(Math.floor(hash01(id) * 1e9));
  const [lo, hi] = (cityId && SKIN_RANGE[cityId]) || [0, SKIN.length - 1];
  const skin = SKIN[lo + Math.floor(r() * (hi - lo + 1))] ?? SKIN[3]!;
  const fem = look.presentation === "feminine";
  const masc = look.presentation === "masculine";
  const senior = look.ageBand === "senior";
  const attire = look.attire.toLowerCase();
  const top =
    ATTIRE_COLOURS.find(([re]) => re.test(attire))?.[1] ??
    FALLBACK_TOPS[Math.floor(r() * FALLBACK_TOPS.length)]!;
  const fullLength = /abaya|kandura|sari|saree|kurta|salwar|veshti/.test(attire);
  return {
    height: (fem ? 1.62 : masc ? 1.75 : 1.68) * (0.97 + r() * 0.06) * (senior ? 0.98 : 1),
    shoulders: fem ? 0.36 : masc ? 0.44 : 0.4,
    hips: fem ? 0.34 : 0.32,
    skin,
    hair: senior ? (r() > 0.4 ? "#c9c5bf" : "#8f8a84") : r() > 0.85 ? "#6b4a2b" : "#1d1714",
    hairLong: fem ? r() > 0.25 : r() > 0.9,
    top,
    bottom: fullLength ? top : r() > 0.5 ? "#2d3142" : "#4a3f35",
    shoes: "#231f1c",
    stoop: senior ? 0.1 : 0,
    pace: senior ? 0.8 : 1,
  };
};
