/**
 * Tier catalog — Phase 7H.
 *
 * XP accrues on social interactions (chat, ask, teach, bond, buy).
 * Tiers are computed from cumulative XP and surfaced on the profile.
 *
 * Kept intentionally short — the point is giving progression a demo-able
 * shape, not building a grinder.
 */

export const TIERS = [
  { id: "newcomer",  label: "Newcomer",   emoji: "🌱", threshold: 0,     color: "#94a3b8" },
  { id: "visitor",   label: "Visitor",    emoji: "🧳", threshold: 50,    color: "#38bdf8" },
  { id: "regular",   label: "Regular",    emoji: "🪑", threshold: 200,   color: "#10b981" },
  { id: "local",     label: "Local",      emoji: "🏘️", threshold: 500,   color: "#f59e0b" },
  { id: "host",      label: "Host",       emoji: "🕯️", threshold: 1200,  color: "#f97316" },
  { id: "elder",     label: "Elder",      emoji: "🦉", threshold: 3000,  color: "#a855f7" },
];

export const XP_EVENTS = {
  chat:       1,
  ask:        4,
  teach:      6,
  bond:       10,
  wave:       1,
  react:      1,
  bazaar_buy: 3,
  food_buy:   1,
  story_post: 8,
  memory:     5,
};

/**
 * Given cumulative XP, return { tier, next } with tier = current TIERS
 * entry and next = the threshold the user is working toward (or null if
 * already at the top).
 */
export const tierForXp = (xp) => {
  const n = Math.max(0, Math.floor(xp || 0));
  let tier = TIERS[0];
  for (const t of TIERS) if (n >= t.threshold) tier = t;
  const idx = TIERS.indexOf(tier);
  const next = idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
  return { tier, next, xp: n, toNext: next ? Math.max(0, next.threshold - n) : 0 };
};

/** Event → delta mapping used by awardXp(). */
export const xpFor = (event) => XP_EVENTS[event] || 0;
