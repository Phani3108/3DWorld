/**
 * knowledgeService — Ask-an-Agent state machine.
 *
 * Flow:
 *   1. Human hits POST /api/v1/ask → we mint a reply token.
 *   2. If the bot has a webhook registered, we POST the question to it;
 *      otherwise we stage the question in a polling queue so it shows up in
 *      GET /api/v1/rooms/:id/events for the bot.
 *   3. Bot answers via POST /api/v1/ask/:token/answer → we broadcast the
 *      answer in the room, append a `learnedFact` to the asker's profile,
 *      and bump the bot's teachingCount.
 *
 * Tokens live 10 minutes. This module holds them in memory — re-issuing on
 * restart is fine (the UX falls back to "no answer" after the timeout).
 */

import crypto from "crypto";

const TOKEN_TTL_MS = 10 * 60 * 1000;

/** @type {Map<string, { fromUserId: string, toBotId: string, question: string, roomId: string, createdAt: number, channel: "webhook"|"polling"|"both" }>} */
const pending = new Map();

/** @type {Map<string, Array<{ question: string, replyToken: string, fromUserId: string, fromName?: string, createdAt: number }>>} */
const pollingQueue = new Map(); // keyed by botId

const newToken = () =>
  crypto.randomUUID ? crypto.randomUUID() : `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const now = () => Date.now();

const sweepExpired = () => {
  const cutoff = now() - TOKEN_TTL_MS;
  for (const [token, entry] of pending) {
    if (entry.createdAt < cutoff) pending.delete(token);
  }
  for (const [botId, queue] of pollingQueue) {
    const filtered = queue.filter((q) => q.createdAt >= cutoff);
    if (filtered.length === 0) pollingQueue.delete(botId);
    else pollingQueue.set(botId, filtered);
  }
};

// Periodic sweep so long-running servers don't accumulate stale tokens.
setInterval(sweepExpired, 60 * 1000).unref?.();

/**
 * Create a pending question. Returns `{ token, ... }` including the channel
 * that was used (webhook vs polling). The caller is responsible for sending
 * the webhook (we only record the decision).
 * @param {{ fromUserId: string, fromName?: string, toBotId: string, question: string, roomId: string, channel: "webhook"|"polling"|"both" }} payload
 */
export const createQuestion = ({ fromUserId, fromName, toBotId, question, roomId, channel, venueId, cityId }) => {
  if (!fromUserId || !toBotId || !question || !roomId) {
    return { ok: false, error: "missing_fields" };
  }
  const trimmed = String(question).slice(0, 500).trim();
  if (!trimmed) return { ok: false, error: "empty_question" };

  const token = newToken();
  const entry = {
    fromUserId,
    fromName,
    toBotId,
    question: trimmed,
    roomId,
    createdAt: now(),
    channel,
    // Phase 7E.6 — carried forward so the answer endpoint can archive
    // with accurate context even when the bot responds minutes later.
    venueId: venueId || null,
    cityId:  cityId  || null,
  };
  pending.set(token, entry);

  // If polling is involved, stash the question so the bot can fetch it.
  if (channel === "polling" || channel === "both") {
    const q = pollingQueue.get(toBotId) || [];
    q.push({
      question: trimmed,
      replyToken: token,
      fromUserId,
      fromName,
      createdAt: entry.createdAt,
    });
    pollingQueue.set(toBotId, q);
  }

  return { ok: true, token, entry };
};

/**
 * Retrieve + consume a pending question by its reply token.
 * @param {string} token
 */
export const claimAnswer = (token) => {
  const entry = pending.get(token);
  if (!entry) return null;
  if (now() - entry.createdAt > TOKEN_TTL_MS) {
    pending.delete(token);
    return null;
  }
  pending.delete(token);
  // Clean up the polling queue entry too.
  const q = pollingQueue.get(entry.toBotId);
  if (q) {
    const idx = q.findIndex((item) => item.replyToken === token);
    if (idx >= 0) q.splice(idx, 1);
    if (q.length === 0) pollingQueue.delete(entry.toBotId);
  }
  return entry;
};

/** Pending questions for a given bot (for the polling-fallback path). */
export const getPendingForBot = (botId) => (pollingQueue.get(botId) || []).slice();

/** Total pending count (for /health + debugging). */
export const pendingCount = () => pending.size;
