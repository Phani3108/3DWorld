/**
 * LLM cost guards.
 *
 * The demo runs on the operator's API key, so spend is capped in dollars:
 *
 *   • Global daily budget — LLM_DAILY_BUDGET_USD (default $2). Once spent,
 *     residents answer from their curated banks until UTC midnight.
 *   • Per-visitor daily turns — LLM_USER_DAILY_TURNS (default 25).
 *   • Per-visitor rate — 6 LLM turns per minute.
 *   • Per-resident concurrency — 2 in flight (extra askers get canned).
 *
 * Callers must key on a *verified* user id (session token checked), never
 * on an id taken from a request body. State is in memory; a restart resets
 * it, which only ever errs toward allowing a little more spend.
 */

const PER_USER_REQS_PER_MIN = 6;
const PER_RESIDENT_CONCURRENT = 2;

const numberFromEnv = (name, fallback) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
};
export const dailyBudgetUsd = () => numberFromEnv("LLM_DAILY_BUDGET_USD", 2);
export const perUserDailyTurns = () => numberFromEnv("LLM_USER_DAILY_TURNS", 25);

const todayKey = () => new Date().toISOString().slice(0, 10); // UTC day

// userId → { day, turns, reqs: [timestamps] }
const userState = new Map();
// residentId → in-flight count
const residentInflight = new Map();
// Global spend for the current UTC day.
const ledger = { day: todayKey(), usd: 0, turns: 0 };

const rollLedger = () => {
  const day = todayKey();
  if (ledger.day !== day) {
    ledger.day = day;
    ledger.usd = 0;
    ledger.turns = 0;
  }
};

const msToUtcMidnight = () => 86_400_000 - (Date.now() % 86_400_000);

/** Rough token estimate for text (used only for display/estimates). */
export const estimateTokens = (text) => {
  if (typeof text !== "string") return 0;
  return Math.max(1, Math.ceil(text.length / 3.5));
};

const getUserEntry = (userId) => {
  const day = todayKey();
  let s = userState.get(userId);
  if (!s || s.day !== day) {
    s = { day, turns: 0, reqs: [] };
    userState.set(userId, s);
  }
  return s;
};

/**
 * May this verified user start another LLM turn with this resident now?
 * @returns {{ ok: true } | { ok: false, reason: string, retryAfterMs?: number }}
 */
export const canSpend = (userId, residentId) => {
  if (!userId) return { ok: false, reason: "no_user" };
  rollLedger();
  if (ledger.usd >= dailyBudgetUsd()) {
    return { ok: false, reason: "daily_budget", retryAfterMs: msToUtcMidnight() };
  }
  const s = getUserEntry(userId);
  if (s.turns >= perUserDailyTurns()) {
    return { ok: false, reason: "daily_turns", retryAfterMs: msToUtcMidnight() };
  }
  const now = Date.now();
  s.reqs = s.reqs.filter((t) => now - t < 60_000);
  if (s.reqs.length >= PER_USER_REQS_PER_MIN) {
    return { ok: false, reason: "per_minute", retryAfterMs: 60_000 - (now - s.reqs[0]) };
  }
  if ((residentInflight.get(residentId) || 0) >= PER_RESIDENT_CONCURRENT) {
    return { ok: false, reason: "resident_busy" };
  }
  return { ok: true };
};

/**
 * Mark an in-flight LLM turn. Call the returned `done(costUsd)` exactly
 * once when it settles (0 when nothing was billed).
 */
export const beginRequest = (userId, residentId) => {
  rollLedger();
  const s = getUserEntry(userId);
  s.reqs.push(Date.now());
  s.turns += 1;
  ledger.turns += 1;
  residentInflight.set(residentId, (residentInflight.get(residentId) || 0) + 1);
  let settled = false;
  return (costUsd = 0) => {
    if (settled) return;
    settled = true;
    const n = residentInflight.get(residentId) || 1;
    if (n <= 1) residentInflight.delete(residentId);
    else residentInflight.set(residentId, n - 1);
    if (typeof costUsd === "number" && Number.isFinite(costUsd) && costUsd > 0) {
      rollLedger();
      ledger.usd += costUsd;
    }
  };
};

/** Diagnostic snapshot for /api/v1/llm/status (no per-user data). */
export const guardStats = () => {
  rollLedger();
  return {
    dailyBudgetUsd: dailyBudgetUsd(),
    spentTodayUsd: Math.round(ledger.usd * 10_000) / 10_000,
    turnsToday: ledger.turns,
    perUserDailyTurns: perUserDailyTurns(),
    perUserReqsPerMin: PER_USER_REQS_PER_MIN,
    perResidentConcurrent: PER_RESIDENT_CONCURRENT,
    budgetExhausted: ledger.usd >= dailyBudgetUsd(),
  };
};

/** Test hook. */
export const __resetCostGuards = () => {
  userState.clear();
  residentInflight.clear();
  ledger.day = todayKey();
  ledger.usd = 0;
  ledger.turns = 0;
};
