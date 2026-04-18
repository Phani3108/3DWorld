/**
 * LLM cost guards — Phase 8D.
 *
 * Keep the demo from accidentally burning a card if someone holds down
 * their ask button or scripts a loop:
 *
 *   • Per-user token budget: 50 k tokens/day (tracked on usage.total_tokens
 *     when provider returns it, else rough 1.3 × char-count estimate).
 *   • Per-user request rate: 20 LLM calls per minute.
 *   • Per-resident concurrency: 2 in-flight at once (excess queued → canned).
 *
 * All limits live in-memory; a restart resets them. That's intentional —
 * these are safety guards, not accounting.
 */

const PER_USER_TOKENS_PER_DAY = 50_000;
const PER_USER_REQS_PER_MIN   = 20;
const PER_RESIDENT_CONCURRENT = 2;

// userId → { tokens, day, reqs: [timestamps] }
const userState = new Map();
// residentId → current in-flight count
const residentInflight = new Map();

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/** Estimate tokens from text length when the provider didn't tell us. */
export const estimateTokens = (text) => {
  if (typeof text !== "string") return 0;
  return Math.max(1, Math.ceil(text.length / 3.5)); // ~1 token per 3.5 chars
};

const getUserEntry = (userId) => {
  let s = userState.get(userId);
  const day = todayKey();
  if (!s || s.day !== day) {
    s = { day, tokens: 0, reqs: [] };
    userState.set(userId, s);
  }
  return s;
};

/**
 * Can this user make another LLM call right now?
 * @param {string} userId
 * @param {string} residentId
 * @returns {{ ok: true } | { ok: false, reason: string, retryAfterMs?: number }}
 */
export const canSpend = (userId, residentId) => {
  if (!userId) return { ok: false, reason: "no_user" };
  const s = getUserEntry(userId);

  // Daily token budget
  if (s.tokens >= PER_USER_TOKENS_PER_DAY) {
    const msToMidnight = (24 * 3600 * 1000) - (Date.now() % (24 * 3600 * 1000));
    return { ok: false, reason: "daily_tokens", retryAfterMs: msToMidnight };
  }

  // Per-minute request rate
  const now = Date.now();
  s.reqs = s.reqs.filter((t) => now - t < 60_000);
  if (s.reqs.length >= PER_USER_REQS_PER_MIN) {
    const oldest = s.reqs[0];
    return { ok: false, reason: "per_minute", retryAfterMs: 60_000 - (now - oldest) };
  }

  // Resident concurrency
  if ((residentInflight.get(residentId) || 0) >= PER_RESIDENT_CONCURRENT) {
    return { ok: false, reason: "resident_busy" };
  }

  return { ok: true };
};

/** Mark a new in-flight LLM request. Call `done(tokens)` when it resolves. */
export const beginRequest = (userId, residentId) => {
  const s = getUserEntry(userId);
  s.reqs.push(Date.now());
  residentInflight.set(residentId, (residentInflight.get(residentId) || 0) + 1);
  return (tokensSpent) => {
    const n = residentInflight.get(residentId) || 1;
    if (n <= 1) residentInflight.delete(residentId);
    else residentInflight.set(residentId, n - 1);
    if (typeof tokensSpent === "number" && tokensSpent > 0) {
      s.tokens += tokensSpent;
    }
  };
};

/** Diagnostic snapshot for /api/v1/llm/status. */
export const guardStats = () => ({
  perUserTokensDaily: PER_USER_TOKENS_PER_DAY,
  perUserReqsPerMin:  PER_USER_REQS_PER_MIN,
  perResidentConcurrent: PER_RESIDENT_CONCURRENT,
  trackedUsers: userState.size,
  trackedResidents: residentInflight.size,
});
