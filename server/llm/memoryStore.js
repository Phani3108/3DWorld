/**
 * LLM conversation memory — Phase 8C.
 *
 * Per-(residentId, userId) rolling window of the last N turns. Written
 * every time an LLM answer is produced, read when building the next
 * prompt. Stored in-memory with an occasional persist so a server
 * restart doesn't wipe fresh context mid-conversation.
 *
 * Turns = ordered array of { role: "user"|"resident", text, at }.
 *
 * Why separate from conversationLog.js (Phase 7E.6)?
 *   • conversationLog is the archive — capped at 2000 globally.
 *   • memoryStore is a small hot cache — ~10 turns per pairing, used
 *     only by the LLM prompt assembly.
 *   • Different shapes, different lifecycles.
 */

import { atomicWriteJson, readJsonSafe } from "../persistence.js";

const MEM_FILE = "llmMemory.json";
const MAX_TURNS_PER_PAIR = 10;

// In-memory map: "residentId::userId" → { turns: [{role,text,at}], updatedAt }
let memory = new Map();

const loadInitial = () => {
  try {
    const raw = readJsonSafe(MEM_FILE, null);
    if (raw && typeof raw === "object") {
      memory = new Map(Object.entries(raw));
    }
  } catch (e) {
    console.warn("[llmMemory] initial load failed:", e.message);
  }
};
loadInitial();

const persistDebouncedState = { timer: null };
const persistSoon = () => {
  if (persistDebouncedState.timer) return;
  persistDebouncedState.timer = setTimeout(() => {
    persistDebouncedState.timer = null;
    try {
      const obj = Object.fromEntries(memory.entries());
      atomicWriteJson(MEM_FILE, obj);
    } catch (e) {
      console.error("[llmMemory] persist failed:", e.message);
    }
  }, 2500);
  persistDebouncedState.timer.unref?.();
};

const keyOf = (residentId, userId) => `${residentId}::${userId}`;

/** Return the current turn list (newest last) for this pairing. */
export const getMemory = (residentId, userId) => {
  const entry = memory.get(keyOf(residentId, userId));
  return entry?.turns || [];
};

/**
 * Append a (user-question, resident-answer) pair. Keeps the window at
 * MAX_TURNS_PER_PAIR and debounce-persists.
 */
export const recordTurn = (residentId, userId, { userText, residentText }) => {
  if (!residentId || !userId) return;
  const k = keyOf(residentId, userId);
  const entry = memory.get(k) || { turns: [], updatedAt: 0 };
  const at = Date.now();
  if (userText)     entry.turns.push({ role: "user",     text: String(userText).slice(0, 800), at });
  if (residentText) entry.turns.push({ role: "resident", text: String(residentText).slice(0, 1200), at });
  while (entry.turns.length > MAX_TURNS_PER_PAIR) entry.turns.shift();
  entry.updatedAt = at;
  memory.set(k, entry);
  persistSoon();
};

/** Manual reset, e.g. when a user says "forget everything we talked about". */
export const clearMemory = (residentId, userId) => {
  memory.delete(keyOf(residentId, userId));
  persistSoon();
};

/** Diagnostic: how many pairings are tracked + their ages. */
export const memoryStats = () => {
  const now = Date.now();
  return {
    pairs: memory.size,
    oldestAgeMs: memory.size
      ? now - Math.min(...[...memory.values()].map((e) => e.updatedAt))
      : 0,
  };
};

export const MAX_MEMORY_TURNS = MAX_TURNS_PER_PAIR;
