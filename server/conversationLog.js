/**
 * conversationLog — append-only archive of Ask-an-Agent Q&A pairs.
 *
 * Phase 7E.6.
 *
 * Every resolved Ask (canned or webhook) is recorded here with:
 *   { id, at, fromUserId, fromName, toBotId, toBotName,
 *     venueId, venueName, cityId, question, answer, tags[], channel }
 *
 * `tags[]` is the thematic vocabulary (pulled from the answering
 * resident's expertise list) so the archive is searchable by topic
 * without requiring an LLM. `venueId` / `cityId` stay as explicit
 * filter fields — they're structural, not thematic.
 *
 * Ambient dialogues (Phase 7E.5) are NOT archived — they're atmosphere.
 * Only Q&A that a person actively asked for is recorded.
 *
 * Backed by a single JSON file, capped at 2000 entries (oldest dropped).
 */

import crypto from "crypto";
import { atomicWriteJson, readJsonSafe, pushCapped } from "./persistence.js";
import { getResident } from "./shared/residentCatalog.js";
import { getVenue } from "./shared/venueCatalog.js";

const LOG_FILE = "conversationLog.json";
const LOG_CAP = 2000;

let conversations = readJsonSafe(LOG_FILE, []);
if (!Array.isArray(conversations)) conversations = [];

const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `cv_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const persist = () => {
  try { atomicWriteJson(LOG_FILE, conversations); }
  catch (e) { console.error("[conversationLog] persist failed:", e.message); }
};

/**
 * Derive the tag list for a conversation entry. Pulls from the
 * answering resident's expertise (catalog), plus a lightweight
 * auto-tag from the venue type if we have one. Never returns more
 * than 8 tags to keep the log compact.
 *
 * @param {{ toBotId?: string, venue?: object }} ctx
 * @returns {string[]}
 */
const deriveTags = ({ toBotId, venue } = {}) => {
  const out = [];
  const seen = new Set();
  const push = (t) => {
    if (!t) return;
    const s = String(t).toLowerCase();
    if (seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  // Resident's expertise — the primary taxonomy.
  if (toBotId) {
    const r = getResident(toBotId);
    if (r && Array.isArray(r.expertise)) {
      for (const tag of r.expertise) push(tag);
    }
  }
  // Venue type — secondary, lets "show me everything from restaurants" work.
  if (venue?.type) push(`type:${venue.type}`);
  return out.slice(0, 8);
};

/**
 * Append a new Q&A to the archive.
 *
 * @param {{
 *   fromUserId: string,
 *   fromName?: string,
 *   toBotId: string,
 *   toBotName?: string,
 *   venueId?: string|null,
 *   cityId?: string|null,
 *   question: string,
 *   answer: string,
 *   channel: "canned"|"webhook"|"polling",
 * }} payload
 * @returns {object|null} the persisted entry (with id/at/tags) or null
 */
export const appendConversation = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const { fromUserId, toBotId, question, answer } = payload;
  if (!fromUserId || !toBotId || !question || !answer) return null;

  const venue = payload.venueId ? getVenue(payload.venueId) : null;
  const resident = getResident(toBotId);
  const tags = deriveTags({ toBotId, venue });

  const entry = {
    id: newId(),
    at: Date.now(),
    fromUserId,
    fromName:  payload.fromName || "",
    toBotId,
    toBotName: payload.toBotName || resident?.name || "",
    venueId:   payload.venueId || null,
    venueName: venue?.name || null,
    cityId:    payload.cityId || venue?.cityId || null,
    question:  String(question).slice(0, 500),
    answer:    String(answer).slice(0, 1200),
    tags,
    channel:   payload.channel || "canned",
  };
  // Newest-first in the file so reads are O(limit), not O(n).
  conversations.unshift(entry);
  if (conversations.length > LOG_CAP) conversations.length = LOG_CAP;
  persist();
  return entry;
};

/**
 * List conversations with optional filters. All filters AND together.
 *
 * @param {{
 *   tag?: string, venue?: string, city?: string, user?: string,
 *   residentId?: string, q?: string, limit?: number,
 * }} [opts]
 * @returns {object[]} newest-first
 */
export const listConversations = (opts = {}) => {
  const limit = Math.max(1, Math.min(LOG_CAP, opts.limit || 50));
  const tag    = opts.tag    ? String(opts.tag).toLowerCase() : null;
  const venue  = opts.venue  ? String(opts.venue)  : null;
  const city   = opts.city   ? String(opts.city)   : null;
  const user   = opts.user   ? String(opts.user)   : null;
  const resident = opts.residentId ? String(opts.residentId) : null;
  const q      = opts.q      ? String(opts.q).toLowerCase() : null;

  const out = [];
  for (const e of conversations) {
    if (tag    && !(Array.isArray(e.tags) && e.tags.includes(tag))) continue;
    if (venue  && e.venueId !== venue)  continue;
    if (city   && e.cityId  !== city)   continue;
    if (user   && e.fromUserId !== user) continue;
    if (resident && e.toBotId  !== resident) continue;
    if (q) {
      const hay = `${e.question} ${e.answer}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(e);
    if (out.length >= limit) break;
  }
  return out;
};

/**
 * Conversations involving a user — either as the asker (fromUserId)
 * OR as the answerer (toBotId === userId, when userId is a resident).
 * Used by the ProfileCard "💬 Recent threads" section.
 *
 * @param {string} userId
 * @param {{ limit?: number }} [opts]
 * @returns {object[]}
 */
export const listConversationsForUser = (userId, opts = {}) => {
  const limit = Math.max(1, Math.min(LOG_CAP, opts.limit || 10));
  const out = [];
  for (const e of conversations) {
    if (e.fromUserId === userId || e.toBotId === userId) out.push(e);
    if (out.length >= limit) break;
  }
  return out;
};

/**
 * Summarise tag frequencies across the archive. Powers the bulletin
 * 🧠 Knowledge-shared tab (Phase 7E.7) and the ProfileCard's tag row.
 *
 * @param {{ cityId?: string, venueId?: string, limit?: number }} [opts]
 * @returns {Array<{ tag: string, count: number }>}
 */
export const tagFrequencies = (opts = {}) => {
  const limit = Math.max(1, Math.min(200, opts.limit || 30));
  const cityId  = opts.cityId  || null;
  const venueId = opts.venueId || null;
  const counts = new Map();
  for (const e of conversations) {
    if (cityId  && e.cityId  !== cityId)  continue;
    if (venueId && e.venueId !== venueId) continue;
    if (!Array.isArray(e.tags)) continue;
    for (const t of e.tags) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/** @returns {number} total archived entries (for /health or admin UIs) */
export const conversationCount = () => conversations.length;
