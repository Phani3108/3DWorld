/**
 * Expertise catalog — the controlled vocabulary of topics a resident
 * (or a human via personaTags) can be expert in.
 *
 * Kept closed so the UI can always render a nice emoji+label chip
 * without guesswork. Adding a tag is one line here.
 *
 * Groups power the "group by" affordance in the expertise browser and
 * the VenueInfoCard host-preview chip row.
 */

export const EXPERTISE_GROUPS = {
  cuisine:  { label: "Food & cooking",  emoji: "🍽️" },
  drink:    { label: "Drink & coffee",  emoji: "☕" },
  language: { label: "Language",        emoji: "🗣️" },
  culture:  { label: "Culture",         emoji: "🏛️" },
  skill:    { label: "Skill",           emoji: "🛠️" },
  sport:    { label: "Sport",           emoji: "🎯" },
  music:    { label: "Music",           emoji: "🎵" },
};

export const EXPERTISE_TAGS = {
  // ── Cuisine / cooking ─────────────────────────────────────────────
  biryani:        { label: "Biryani",        emoji: "🍛", group: "cuisine" },
  "dum-cooking":  { label: "Dum cooking",    emoji: "🫕", group: "cuisine" },
  "kachche-gosht":{ label: "Kachche gosht",  emoji: "🥩", group: "cuisine" },
  haleem:         { label: "Haleem",         emoji: "🥣", group: "cuisine" },
  "south-indian": { label: "South Indian",   emoji: "🥞", group: "cuisine" },
  pastrami:       { label: "Pastrami",       emoji: "🥪", group: "cuisine" },
  "bagel-culture":{ label: "Bagels",         emoji: "🥯", group: "cuisine" },
  "parsi-cuisine":{ label: "Parsi cuisine",  emoji: "🍮", group: "cuisine" },
  "street-food":  { label: "Street food",    emoji: "🥡", group: "cuisine" },
  "hawker-food":  { label: "Hawker food",    emoji: "🍜", group: "cuisine" },
  "chicken-rice": { label: "Chicken rice",   emoji: "🍚", group: "cuisine" },
  laksa:          { label: "Laksa",          emoji: "🍝", group: "cuisine" },
  "kaya-toast":   { label: "Kaya toast",     emoji: "🍞", group: "cuisine" },
  "fish-and-chips":{label: "Fish & chips",   emoji: "🐟", group: "cuisine" },

  // ── Drinks ────────────────────────────────────────────────────────
  "irani-chai":   { label: "Irani chai",     emoji: "🫖", group: "drink" },
  "cutting-chai": { label: "Cutting chai",   emoji: "🍵", group: "drink" },
  "filter-coffee":{ label: "Filter coffee",  emoji: "☕", group: "drink" },
  "flat-white":   { label: "Flat white",     emoji: "☕", group: "drink" },
  "kopi-codes":   { label: "Kopi codes",     emoji: "☕", group: "drink" },
  "arabic-coffee":{ label: "Gahwa",          emoji: "☕", group: "drink" },
  "craft-beer":   { label: "Craft beer",     emoji: "🍺", group: "drink" },
  "third-wave":   { label: "Third-wave",     emoji: "🫘", group: "drink" },

  // ── Languages ─────────────────────────────────────────────────────
  "hyderabadi-urdu":{label:"Hyderabadi Urdu",emoji: "🗣️", group: "language" },
  "bombay-tapori":{ label: "Tapori Hindi",   emoji: "🗣️", group: "language" },
  kannada:        { label: "Kannada",        emoji: "🗣️", group: "language" },
  singlish:       { label: "Singlish",       emoji: "🗣️", group: "language" },
  "aussie-slang": { label: "Aussie slang",   emoji: "🗣️", group: "language" },
  "nyc-slang":    { label: "NYC slang",      emoji: "🗣️", group: "language" },
  "gulf-arabic":  { label: "Gulf Arabic",    emoji: "🗣️", group: "language" },

  // ── Culture ───────────────────────────────────────────────────────
  "gulf-hospitality":{ label: "Gulf hospitality", emoji: "🕌", group: "culture" },
  "bedouin-lore": { label: "Bedouin lore",   emoji: "🐪", group: "culture" },
  "parsi-history":{ label: "Parsi history",  emoji: "📜", group: "culture" },
  "nyc-delis":    { label: "NYC delis",      emoji: "🏙️", group: "culture" },
  "bodega-culture":{ label: "Bodega culture",emoji: "🏪", group: "culture" },
  "bombay-lore":  { label: "Bombay lore",    emoji: "🌇", group: "culture" },
  "ramzan-iftar": { label: "Ramzan & iftar", emoji: "🌙", group: "culture" },
  "chope-culture":{ label: "Chope culture",  emoji: "🪑", group: "culture" },
  "kopitiam":     { label: "Kopitiam",       emoji: "🏪", group: "culture" },
  "bondi-surf":   { label: "Bondi surf",     emoji: "🏄", group: "culture" },
  "surf-culture": { label: "Surf culture",   emoji: "🌊", group: "culture" },

  // ── Skills / domains ──────────────────────────────────────────────
  "gold-trading": { label: "Gold trading",   emoji: "🪙", group: "skill" },
  "karat-testing":{ label: "Karat testing",  emoji: "⚖️", group: "skill" },
  "tech-bengaluru":{label: "Bengaluru tech", emoji: "💻", group: "skill" },
  philosophy:     { label: "Philosophy",     emoji: "💭", group: "skill" },
  "stars-navigation":{label:"Stars & night sky",emoji:"🌌",group:"skill" },
  "story-telling":{ label: "Storytelling",   emoji: "📖", group: "skill" },

  // ── Sport / leisure ───────────────────────────────────────────────
  cricket:        { label: "Cricket",        emoji: "🏏", group: "sport" },
  chess:          { label: "Chess",          emoji: "♟️", group: "sport" },

  // ── Music ─────────────────────────────────────────────────────────
  "indie-music":  { label: "Indie music",    emoji: "🎸", group: "music" },
  "jazz-nyc":     { label: "NYC jazz",       emoji: "🎷", group: "music" },
  qawwali:        { label: "Qawwali",        emoji: "🎶", group: "music" },
  oud:            { label: "Oud",            emoji: "🎵", group: "music" },
  "hip-hop":      { label: "Hip-hop",        emoji: "🎤", group: "music" },

  // ── Phase 7E.4: regulars add these ────────────────────────────────
  "local-trains":    { label: "Local trains",    emoji: "🚉", group: "culture" },
  "lower-east-side": { label: "Lower East Side", emoji: "🗽", group: "culture" },
  "political-banter":{ label: "Political banter",emoji: "🗞️", group: "culture" },
  poetry:            { label: "Poetry",          emoji: "📝", group: "culture" },
  pickling:          { label: "Pickling",        emoji: "🥒", group: "cuisine" },
  hokkien:           { label: "Hokkien",         emoji: "🗣️", group: "language" },
  "espresso-science":{ label: "Espresso science",emoji: "🧪", group: "skill" },
  "coffee-craft":    { label: "Coffee craft",    emoji: "☕", group: "skill" },
};

export const listExpertiseTags = () => Object.keys(EXPERTISE_TAGS);

export const getExpertise = (tag) => EXPERTISE_TAGS[tag] || null;

/**
 * Validate + normalise a user-supplied persona tag list. Drops unknown
 * tags silently; caps at `max` entries. Used by personaTags setters
 * (WelcomeModal in 7E.3) and by resident catalog validation.
 */
export const normalizeExpertiseTags = (tags, max = 6) => {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    if (typeof t !== "string") continue;
    const tag = t.trim().toLowerCase();
    if (!EXPERTISE_TAGS[tag] || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= max) break;
  }
  return out;
};

/**
 * Return the catalog entries for a list of tag ids, filtered to those
 * that exist in the catalog. Handy for clients that want {label, emoji}.
 */
export const hydrateExpertiseTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  const out = [];
  for (const t of tags) {
    const entry = EXPERTISE_TAGS[t];
    if (entry) out.push({ id: t, ...entry });
  }
  return out;
};
