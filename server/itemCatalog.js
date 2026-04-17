// Item catalog: furniture definitions, avatar URLs, emotes, and accent colours.
// Extracted from index.js — pure constants, zero dependencies.

// ── Emotes ──────────────────────────────────────────────────────────
// Expanded set (v2). Clients that don't yet ship a matching animation fall
// back to the closest available one and overlay a "*<emote>s*" speech bubble
// so the UX still lands.
export const ALLOWED_EMOTES = [
  // v1 — must stay first for backward-compat
  "dance", "wave", "sit", "nod", "highfive", "hug",
  // social
  "laugh", "clap", "cheer", "bow", "point", "agree", "disagree", "shrug", "think",
  // physical
  "jump", "spin", "stretch", "yawn", "sleep",
  // expressive
  "heart", "peace", "cry", "angry", "wink", "kiss",
  // city-flavour
  "namaste", "salaam",
];

// ── Avatars ─────────────────────────────────────────────────────────
// AVATAR_CATALOG is the source of truth. AVATAR_URLS stays exported for
// backward compatibility with code paths that only care about the URL list.
export const AVATAR_CATALOG = [
  // v1 — preserved
  { id: "rpm_casual_1",  url: "https://models.readyplayer.me/64f0265b1db75f90dcfd9e2c.glb", label: "Casual",        tags: ["human"] },
  { id: "rpm_smart_1",   url: "https://models.readyplayer.me/663833cf6c79010563b91e1b.glb", label: "Smart",         tags: ["human"] },
  { id: "rpm_cozy_1",    url: "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb", label: "Cozy",          tags: ["human"] },
  { id: "rpm_work_1",    url: "https://models.readyplayer.me/64a3f54c1d64e9f3dbc832ac.glb", label: "At Work",       tags: ["human"] },
  { id: "silly_nub_cat", url: "/models/sillyNubCat.glb",                                     label: "Silly Nub Cat", tags: ["creature"] },
];

// Accept any RPM-hosted `.glb` as a user-supplied custom avatar.
const RPM_CUSTOM_RE = /^https:\/\/models\.readyplayer\.me\/[A-Za-z0-9]+\.glb$/;

/** All pre-approved URLs (strict allowlist, excludes custom). */
export const AVATAR_URLS = AVATAR_CATALOG.map((a) => a.url);
export const DEFAULT_AVATAR_URL = AVATAR_URLS[0];

export const randomAvatarUrl = () =>
  AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length)];

/**
 * Sanitize an avatar URL. Accepts either:
 *   - A URL that matches an entry in AVATAR_CATALOG (ignoring ?queryString), or
 *   - A custom Ready Player Me URL shaped like https://models.readyplayer.me/<id>.glb
 * Anything else falls back to the default.
 */
export const sanitizeAvatarUrl = (url) => {
  if (!url || typeof url !== "string") return DEFAULT_AVATAR_URL;
  const bare = url.split("?")[0];
  if (AVATAR_URLS.includes(bare)) return url;
  if (RPM_CUSTOM_RE.test(bare)) return bare;
  return DEFAULT_AVATAR_URL;
};

/** Map avatar id → catalog entry. */
export const getAvatarById = (id) =>
  AVATAR_CATALOG.find((a) => a.id === id) || null;

// ── Accent Colours ──────────────────────────────────────────────────
// Tints name plates, speech bubbles and chat log names. Pure data.
export const ACCENT_COLORS = [
  { id: "sky",     hex: "#38bdf8", label: "Sky" },
  { id: "rose",    hex: "#fb7185", label: "Rose" },
  { id: "emerald", hex: "#10b981", label: "Emerald" },
  { id: "amber",   hex: "#f59e0b", label: "Amber" },
  { id: "violet",  hex: "#8b5cf6", label: "Violet" },
  { id: "teal",    hex: "#14b8a6", label: "Teal" },
  { id: "orange",  hex: "#fb923c", label: "Orange" },
  { id: "slate",   hex: "#64748b", label: "Slate" },
];
export const DEFAULT_ACCENT_ID = "sky";

export const getAccentById = (id) =>
  ACCENT_COLORS.find((c) => c.id === id) || null;

export const sanitizeAccentId = (id) =>
  (id && ACCENT_COLORS.some((c) => c.id === id)) ? id : DEFAULT_ACCENT_ID;

export const items = {
  washer: { name: "washer", size: [2, 2] },
  toiletSquare: { name: "toiletSquare", size: [2, 2] },
  trashcan: { name: "trashcan", size: [1, 1] },
  bathroomCabinetDrawer: { name: "bathroomCabinetDrawer", size: [2, 2] },
  bathtub: { name: "bathtub", size: [4, 2] },
  bathroomMirror: { name: "bathroomMirror", size: [2, 1], wall: true },
  bathroomCabinet: { name: "bathroomCabinet", size: [2, 1], wall: true },
  bathroomSink: { name: "bathroomSink", size: [2, 2] },
  showerRound: { name: "showerRound", size: [2, 2] },
  tableCoffee: { name: "tableCoffee", size: [4, 2] },
  loungeSofaCorner: { name: "loungeSofaCorner", size: [5, 5], rotation: 2, sittable: { seats: 4, seatHeight: 0.45 } },
  bear: { name: "bear", size: [2, 1], wall: true },
  loungeSofaOttoman: { name: "loungeSofaOttoman", size: [2, 2], sittable: { seats: 1, seatHeight: 0.35 } },
  tableCoffeeGlassSquare: { name: "tableCoffeeGlassSquare", size: [2, 2] },
  loungeDesignSofaCorner: { name: "loungeDesignSofaCorner", size: [5, 5], rotation: 2, sittable: { seats: 4, seatHeight: 0.45 } },
  loungeDesignSofa: { name: "loungeDesignSofa", size: [5, 2], rotation: 2, sittable: { seats: 3, seatHeight: 0.45 } },
  loungeSofa: { name: "loungeSofa", size: [5, 2], rotation: 2, sittable: { seats: 3, seatHeight: 0.45 } },
  bookcaseOpenLow: { name: "bookcaseOpenLow", size: [2, 1] },
  bookcaseClosedWide: { name: "bookcaseClosedWide", size: [3, 1], rotation: 2 },
  bedSingle: { name: "bedSingle", size: [3, 6], rotation: 2 },
  bench: { name: "bench", size: [2, 1], rotation: 2, sittable: { seats: 2, seatHeight: 0.4 } },
  bedDouble: { name: "bedDouble", size: [5, 5], rotation: 2 },
  benchCushionLow: { name: "benchCushionLow", size: [2, 1], sittable: { seats: 2, seatHeight: 0.35 } },
  loungeChair: { name: "loungeChair", size: [2, 2], rotation: 2, sittable: { seats: 1, seatHeight: 0.4 } },
  cabinetBedDrawer: { name: "cabinetBedDrawer", size: [1, 1], rotation: 2 },
  cabinetBedDrawerTable: { name: "cabinetBedDrawerTable", size: [1, 1], rotation: 2 },
  table: { name: "table", size: [4, 2] },
  tableCrossCloth: { name: "tableCrossCloth", size: [4, 2] },
  plant: { name: "plant", size: [1, 1] },
  plantSmall: { name: "plantSmall", size: [1, 1] },
  rugRounded: { name: "rugRounded", size: [6, 4], walkable: true },
  rugRound: { name: "rugRound", size: [4, 4], walkable: true },
  rugSquare: { name: "rugSquare", size: [4, 4], walkable: true },
  rugRectangle: { name: "rugRectangle", size: [8, 4], walkable: true },
  televisionVintage: { name: "televisionVintage", size: [4, 2], rotation: 2 },
  televisionModern: { name: "televisionModern", size: [4, 2], rotation: 2 },
  kitchenFridge: { name: "kitchenFridge", size: [2, 1], rotation: 2 },
  kitchenFridgeLarge: { name: "kitchenFridgeLarge", size: [2, 1] },
  kitchenBar: { name: "kitchenBar", size: [2, 1] },
  kitchenCabinetCornerRound: { name: "kitchenCabinetCornerRound", size: [2, 2] },
  kitchenCabinetCornerInner: { name: "kitchenCabinetCornerInner", size: [2, 2] },
  kitchenCabinet: { name: "kitchenCabinet", size: [2, 2] },
  kitchenBlender: { name: "kitchenBlender", size: [1, 1] },
  dryer: { name: "dryer", size: [2, 2] },
  chairCushion: { name: "chairCushion", size: [1, 1], rotation: 2, sittable: { seats: 1, seatHeight: 0.45 } },
  chair: { name: "chair", size: [1, 1], rotation: 2, sittable: { seats: 1, seatHeight: 0.45 } },
  deskComputer: { name: "deskComputer", size: [3, 2] },
  desk: { name: "desk", size: [3, 2] },
  chairModernCushion: { name: "chairModernCushion", size: [1, 1], rotation: 2, sittable: { seats: 1, seatHeight: 0.45 } },
  chairModernFrameCushion: { name: "chairModernFrameCushion", size: [1, 1], rotation: 2, sittable: { seats: 1, seatHeight: 0.45 } },
  kitchenMicrowave: { name: "kitchenMicrowave", size: [1, 1] },
  coatRackStanding: { name: "coatRackStanding", size: [1, 1] },
  kitchenSink: { name: "kitchenSink", size: [2, 2] },
  lampRoundFloor: { name: "lampRoundFloor", size: [1, 1] },
  lampRoundTable: { name: "lampRoundTable", size: [1, 1] },
  lampSquareFloor: { name: "lampSquareFloor", size: [1, 1] },
  lampSquareTable: { name: "lampSquareTable", size: [1, 1] },
  toaster: { name: "toaster", size: [1, 1] },
  kitchenStove: { name: "kitchenStove", size: [2, 2] },
  laptop: { name: "laptop", size: [1, 1] },
  radio: { name: "radio", size: [1, 1] },
  speaker: { name: "speaker", size: [1, 1] },
  speakerSmall: { name: "speakerSmall", size: [1, 1], rotation: 2 },
  stoolBar: { name: "stoolBar", size: [1, 1], sittable: { seats: 1, seatHeight: 0.6 } },
  stoolBarSquare: { name: "stoolBarSquare", size: [1, 1], sittable: { seats: 1, seatHeight: 0.6 } },
};

// Alias for use inside handlers where "items" parameter shadows this
export const itemsCatalog = items;
