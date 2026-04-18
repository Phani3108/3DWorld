/**
 * reputationService — Phase 9C.
 *
 * Per-(userId, cityId) integer score that accrues from social acts
 * (asking, teaching, completing quests, posting stories) and gates
 * higher-value interactions like cross-city travel and rare barter.
 *
 * Persisted to reputation.json as { [userId]: { [cityId]: score } }.
 */

import fs from "fs";
import { atomicWriteJson, readJsonSafe } from "./persistence.js";

const REPUTATION_FILE = "reputation.json";
let data = readJsonSafe(REPUTATION_FILE, {});
if (!data || typeof data !== "object") data = {};

const persistTimer = { t: null };
const persist = () => {
  if (persistTimer.t) return;
  persistTimer.t = setTimeout(() => {
    persistTimer.t = null;
    try { atomicWriteJson(REPUTATION_FILE, data); }
    catch (e) { console.error("[reputation] persist failed:", e.message); }
  }, 1500);
  persistTimer.t.unref?.();
};

export const getReputation = (userId, cityId) => {
  if (!userId || !cityId) return 0;
  return (data[userId] && data[userId][cityId]) || 0;
};

/** All city scores for a user, sorted desc. */
export const getUserReputation = (userId) => {
  if (!userId) return [];
  const byCity = data[userId] || {};
  return Object.entries(byCity)
    .map(([cityId, score]) => ({ cityId, score }))
    .sort((a, b) => b.score - a.score);
};

/** Add `delta` reputation to userId in cityId. Negative allowed. */
export const addReputation = (userId, cityId, delta) => {
  if (!userId || !cityId) return 0;
  if (typeof delta !== "number" || delta === 0) return getReputation(userId, cityId);
  if (!data[userId]) data[userId] = {};
  data[userId][cityId] = Math.max(0, (data[userId][cityId] || 0) + delta);
  persist();
  return data[userId][cityId];
};

/**
 * Top-N leaderboard for a city. Used by the daily digest (9E) and the
 * city info panel.
 */
export const cityLeaderboard = (cityId, limit = 10) => {
  if (!cityId) return [];
  const out = [];
  for (const [userId, byCity] of Object.entries(data)) {
    const score = byCity[cityId] || 0;
    if (score > 0) out.push({ userId, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, Math.max(1, Math.min(100, limit)));
};

export const loadReputationStore = () => {
  try {
    if (!fs.existsSync(REPUTATION_FILE)) return;
    const raw = readJsonSafe(REPUTATION_FILE, {});
    if (raw && typeof raw === "object") data = raw;
  } catch (e) {
    console.warn("[reputation] load failed:", e.message);
  }
};

/** Reputation tiers for the profile pill. */
export const REPUTATION_TIERS = [
  { threshold: 0,   label: "Unknown",    emoji: "·"  },
  { threshold: 25,  label: "Familiar",   emoji: "🙂" },
  { threshold: 75,  label: "Welcome",    emoji: "🎟️" },
  { threshold: 200, label: "Regular",    emoji: "🪑" },
  { threshold: 500, label: "Local Hero", emoji: "🏅" },
];

export const reputationTier = (score) => {
  const n = Math.max(0, Math.floor(score || 0));
  let tier = REPUTATION_TIERS[0];
  for (const t of REPUTATION_TIERS) if (n >= t.threshold) tier = t;
  return { ...tier, score: n };
};
