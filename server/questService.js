/**
 * questService — Phase 9B.
 *
 * Per-user quest state, persisted to disk.
 *
 *   users.<userId>.quests = {
 *     active:    { [questId]: { acceptedAt, progress } },
 *     completed: { [questId]: { completedAt, reward } },
 *   }
 *
 * The service exposes three top-level operations:
 *   • acceptQuest(userId, questId)
 *   • tickEvent(userId, { type, target })     ← called from hooks
 *   • listUserQuests(userId)                  ← profile surface
 *
 * Progress is idempotent: if the quest is already at `goal.count`, ticks
 * are ignored. Rewards fire once at the moment the quest completes.
 */

import fs from "fs";
import { atomicWriteJson, readJsonSafe } from "./persistence.js";
import { getQuest, matchEvent, allQuestsPublic } from "./shared/questCatalog.js";

const QUEST_STATE_FILE = "userQuests.json";
// { [userId]: { active: {...}, completed: {...} } }
let state = readJsonSafe(QUEST_STATE_FILE, {});
if (!state || typeof state !== "object") state = {};

const persistTimer = { t: null };
const persist = () => {
  if (persistTimer.t) return;
  persistTimer.t = setTimeout(() => {
    persistTimer.t = null;
    try { atomicWriteJson(QUEST_STATE_FILE, state); }
    catch (e) { console.error("[questService] persist failed:", e.message); }
  }, 1500);
  persistTimer.t.unref?.();
};

const ensureUserSlot = (userId) => {
  if (!state[userId]) state[userId] = { active: {}, completed: {} };
  if (!state[userId].active) state[userId].active = {};
  if (!state[userId].completed) state[userId].completed = {};
  return state[userId];
};

/**
 * User accepts a quest. Returns `{ ok: true, quest }` or
 * `{ ok: false, error }`.
 */
export const acceptQuest = (userId, questId) => {
  if (!userId || !questId) return { ok: false, error: "missing_fields" };
  const quest = getQuest(questId);
  if (!quest) return { ok: false, error: "quest_not_found" };
  const slot = ensureUserSlot(userId);
  if (slot.completed[questId]) return { ok: false, error: "already_completed" };
  if (slot.active[questId])    return { ok: false, error: "already_active" };
  slot.active[questId] = { acceptedAt: Date.now(), progress: 0 };
  persist();
  return { ok: true, quest, state: slot.active[questId] };
};

/**
 * Fire an event across all of the user's active quests. Returns any
 * quests that completed on this tick (so the caller can award rewards
 * + push a toast/feed entry).
 */
export const tickEvent = (userId, event) => {
  if (!userId || !event) return [];
  const slot = ensureUserSlot(userId);
  const completed = [];
  for (const [questId, st] of Object.entries(slot.active)) {
    const quest = getQuest(questId);
    if (!quest) continue;
    const needed = quest.goal?.count || 1;
    if (st.progress >= needed) continue; // shouldn't happen but safe
    const inc = matchEvent(quest, event);
    if (inc <= 0) continue;
    st.progress = Math.min(needed, st.progress + inc);
    if (st.progress >= needed) {
      delete slot.active[questId];
      slot.completed[questId] = {
        completedAt: Date.now(),
        reward: quest.reward || {},
      };
      completed.push(quest);
    }
  }
  if (completed.length > 0) persist();
  else if (Object.keys(slot.active).length > 0) persist();
  return completed;
};

/**
 * Full projection of a user's quests for the client. Merges catalog
 * metadata with per-user progress state.
 */
export const listUserQuests = (userId) => {
  const slot = state[userId] || { active: {}, completed: {} };
  const active = Object.entries(slot.active).map(([id, st]) => {
    const quest = getQuest(id);
    if (!quest) return null;
    return { ...quest, state: "active", progress: st.progress, acceptedAt: st.acceptedAt };
  }).filter(Boolean);
  const completed = Object.entries(slot.completed).map(([id, st]) => {
    const quest = getQuest(id);
    if (!quest) return null;
    return { ...quest, state: "completed", completedAt: st.completedAt, reward: st.reward };
  }).filter(Boolean);
  // Offers = anything neither active nor completed.
  const seen = new Set([...Object.keys(slot.active), ...Object.keys(slot.completed)]);
  const offers = allQuestsPublic().filter((q) => !seen.has(q.id)).map((q) => ({ ...q, state: "offer" }));
  return { active, completed, offers };
};

/**
 * Raw state getter — used by the ProfileCard stat projection.
 */
export const questCounts = (userId) => {
  const slot = state[userId] || { active: {}, completed: {} };
  return {
    active:    Object.keys(slot.active).length,
    completed: Object.keys(slot.completed).length,
  };
};

/** File recovery on fresh disk. */
export const loadQuestStore = () => {
  try {
    if (!fs.existsSync(QUEST_STATE_FILE)) return;
    const raw = readJsonSafe(QUEST_STATE_FILE, {});
    if (raw && typeof raw === "object") state = raw;
  } catch (e) {
    console.warn("[questService] load failed:", e.message);
  }
};

/**
 * Glue helper — fire an event and apply rewards for anything that just
 * completed. Returns the quests that completed (for UI toast). Keeps
 * the coin/XP/rep wiring colocated so call sites only need one import.
 */
export const fireQuestEvent = async (userId, event, deps = {}) => {
  const completed = tickEvent(userId, event);
  if (completed.length === 0) return [];
  try {
    const { updateUserCoins, awardXp } = await import("./userStore.js");
    const { addReputation }            = await import("./reputationService.js");
    const { addToFeed }                = await import("./worldFeed.js");
    const { getResident }              = await import("./shared/residentCatalog.js");
    for (const q of completed) {
      const r = q.reward || {};
      if (r.coins) await updateUserCoins(userId, r.coins);
      if (r.xp)    await awardXp(userId, "quest_complete", r.xp);
      if (r.reputation) {
        const giver = getResident(q.giverId);
        if (giver?.cityId) addReputation(userId, giver.cityId, r.reputation);
      }
      addToFeed({
        type: "quest",
        actorUserId: userId,
        actorName: deps.fromName || "",
        cityId: (getResident(q.giverId) || {}).cityId || null,
        text: `completed "${q.title}" (+${r.coins || 0} 🪙, +${r.xp || 0} XP)`,
        emoji: "🎯",
        meta: { questId: q.id, giverId: q.giverId },
      });
    }
  } catch (e) {
    console.warn("[questService] reward failed:", e.message);
  }
  return completed;
};
