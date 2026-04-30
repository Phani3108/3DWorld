/**
 * Avatar defaults — Phase 11A.
 *
 * Resolves a stable, non-cartoon "AI portrait" URL for any user/resident
 * who hasn't uploaded their own photo. Uses the free hosted DiceBear API
 * (https://www.dicebear.com/) — deterministic per seed, free, no auth,
 * no asset commits.
 *
 *   `https://api.dicebear.com/9.x/{style}/svg?seed={seed}`
 *
 * The `seed` is a userId or residentId — same id always produces the
 * same portrait, so a user's avatar stays consistent across sessions.
 *
 * Why centralise in this module?
 *   • Both `userStore.ensureProfileDefaults` and `residentService` need
 *     the same URL pattern.
 *   • If we later switch styles or move to a different service, only
 *     this file changes.
 *   • Tests can pin the URL shape without grepping multiple files.
 *
 * Locked from the Phase 11 plan: style = "personas" (semi-illustrated,
 * social-app friendly). lorelei is a viable alternative for a softer
 * indie-game look — change `DEFAULT_STYLE` only.
 */

export const DICEBEAR_BASE = "https://api.dicebear.com/9.x";
export const DEFAULT_STYLE = "personas";
export const RESIDENT_STYLE = "personas"; // residents share the human style for consistency

/**
 * Build the full DiceBear URL for a given seed + optional style.
 * Encodes the seed so unusual ids (with spaces / unicode) don't break.
 */
export const dicebearUrl = (seed, style = DEFAULT_STYLE) => {
  if (!seed || typeof seed !== "string") return null;
  const safeSeed = encodeURIComponent(seed);
  return `${DICEBEAR_BASE}/${style}/svg?seed=${safeSeed}`;
};

/**
 * URL pattern matcher — used by tests + by updateProfile to detect
 * "this is a default DiceBear portrait" so user uploads can override
 * cleanly.
 */
export const isDicebearUrl = (url) =>
  typeof url === "string" && url.startsWith(DICEBEAR_BASE);
