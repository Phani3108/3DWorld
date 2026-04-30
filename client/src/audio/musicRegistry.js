/**
 * Phase 10G — Music registry helpers.
 *
 * Bridges the catalog-driven music paths in cityCatalog (`ambient` field)
 * and venueCatalog (`ambience.music`) into the SoundManager's runtime
 * track table.
 *
 * Why a helper layer (vs. registering everything at boot)?
 *   • The full catalog never lives on the client — we get one venue at
 *     a time via the venueEnter socket event, so registration must be
 *     lazy.
 *   • The cityId and venue payload have stable, predictable URLs we can
 *     derive once and dedupe by track key.
 *   • Asset 404s should not crash anything — SoundManager._failed marks
 *     missing files and playMusic skips them; this helper just declares
 *     intent.
 *
 * Track key conventions (so MusicChip + tests can find them):
 *   • City ambient :  `city_<cityId>`              → `/audio/ambient/<cityId>.ogg`
 *   • Venue track  :  `venue_<venueId>`            → from venue.ambience.music
 *
 * Title / source / license on each registration come from the venue's
 * `ambience.musicCredit` (when present) so the 🔊 chip shows attribution
 * for CC-BY tracks. CC0 tracks can omit `musicCredit`.
 */

import soundManager from "./SoundManager.js";

export const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Title-case helper for chip display when no explicit title is given. */
const niceCity = (cityId) =>
  String(cityId || "").replace(/^./, (c) => c.toUpperCase()).replace(/_/g, " ");

/**
 * Register and return the track key for a city's ambient bed.
 * @param {string} cityId
 * @returns {string|null} key (or null if cityId invalid)
 */
export const registerCityMusic = (cityId) => {
  if (!cityId || typeof cityId !== "string") return null;
  const key = `city_${cityId}`;
  soundManager.registerMusic(key, {
    src: `/audio/ambient/${cityId}.ogg`,
    title: `${niceCity(cityId)} ambient`,
    source: null,
    license: "CC0",
    loop: true,
    volume: 0.4,
    category: "music",
  });
  return key;
};

/**
 * Register and return the track key for a venue's music.
 * Reads `venue.ambience.music` (path) + `venue.ambience.musicCredit`
 * (attribution string).
 * @param {object} venue — venueCatalog public projection
 * @returns {string|null} key (or null if no music declared)
 */
export const registerVenueMusic = (venue) => {
  if (!venue?.id) return null;
  const src = venue.ambience?.music;
  if (!src) return null;
  const key = `venue_${venue.id}`;
  const credit = venue.ambience?.musicCredit || "";
  // Heuristic: if the credit mentions "CC-BY" or has the word "by", treat as CC-BY.
  const license = /CC[\s-]?BY/i.test(credit) ? "CC-BY" : (credit ? "see credit" : "CC0");
  soundManager.registerMusic(key, {
    src,
    title: `${venue.name || venue.id}`,
    source: credit || null,
    license,
    loop: true,
    volume: 0.5,
    category: "music",
  });
  return key;
};

/**
 * Convenience: register both venue + city for a venue payload, return a
 * fall-through-able list of keys: [venueKey, cityKey].
 */
export const candidatesForVenue = (venue) => {
  const out = [];
  const v = registerVenueMusic(venue);
  if (v) out.push(v);
  const c = registerCityMusic(venue?.cityId);
  if (c) out.push(c);
  return out;
};
