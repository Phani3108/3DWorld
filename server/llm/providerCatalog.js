/**
 * LLM provider abstraction — Phase 8A.
 *
 * Three providers are supported:
 *   • "anthropic" — Claude Sonnet/Haiku via /v1/messages
 *   • "openai"    — GPT-4o-mini / GPT-4o via /v1/chat/completions
 *   • "stub"      — deterministic echo; used when no API key is set so
 *                   the demo still visibly exercises the LLM path without
 *                   costing anything.
 *
 * Selection:
 *   env LLM_PROVIDER=anthropic|openai|stub (default: auto — picks first
 *                   provider whose API key is set, else "stub")
 *   env LLM_API_KEY=...
 *   env LLM_MODEL=...  (default: sensible per-provider)
 *
 * Each provider exposes `answer({ system, user, history })` returning
 * `{ ok: true, text }` on success or `{ ok: false, error, retryable }`.
 * Never throws — callers always receive the result envelope.
 */

const ANTHROPIC_DEFAULT_MODEL = "claude-sonnet-4-5";
const OPENAI_DEFAULT_MODEL    = "gpt-4o-mini";
const MAX_ANSWER_TOKENS       = 300;   // short enough to stay conversational
const REQUEST_TIMEOUT_MS      = 15_000;

const envKey = () => process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "";
const envModel = () => process.env.LLM_MODEL || "";

const resolveProviderId = () => {
  const raw = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (raw === "anthropic" || raw === "openai" || raw === "stub") return raw;
  // Auto: prefer Anthropic if ANTHROPIC_API_KEY, then OpenAI, then stub.
  if (process.env.ANTHROPIC_API_KEY || /^sk-ant-/i.test(envKey())) return "anthropic";
  if (process.env.OPENAI_API_KEY    || /^sk-[A-Za-z0-9]/i.test(envKey())) return "openai";
  return "stub";
};

/**
 * Wrap fetch with a timeout — bare `AbortController` pattern so Node's
 * built-in fetch (Node 18+) works without extra deps.
 */
const timedFetch = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

// ── Anthropic ────────────────────────────────────────────────────────
const anthropicProvider = {
  id: "anthropic",
  model: envModel() || ANTHROPIC_DEFAULT_MODEL,
  async answer({ system, user, history = [] }) {
    const apiKey = process.env.ANTHROPIC_API_KEY || envKey();
    if (!apiKey) return { ok: false, error: "no_api_key", retryable: false };
    const messages = [];
    for (const h of history) {
      messages.push({ role: h.role === "resident" ? "assistant" : "user", content: h.text });
    }
    messages.push({ role: "user", content: user });
    try {
      const res = await timedFetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
          "content-type":      "application/json",
        },
        body: JSON.stringify({
          model:      this.model,
          max_tokens: MAX_ANSWER_TOKENS,
          system,
          messages,
        }),
      });
      if (!res.ok) {
        const status = res.status;
        const txt = await res.text().catch(() => "");
        return { ok: false, error: `anthropic_${status}`, detail: txt.slice(0, 200), retryable: status >= 500 || status === 429 };
      }
      const data = await res.json();
      const text = Array.isArray(data?.content)
        ? data.content.map((b) => b.text).filter(Boolean).join("\n").trim()
        : "";
      if (!text) return { ok: false, error: "empty_response", retryable: true };
      return { ok: true, text, usage: data?.usage || null };
    } catch (e) {
      return { ok: false, error: e?.name === "AbortError" ? "timeout" : "network_error", detail: e?.message, retryable: true };
    }
  },
};

// ── OpenAI ───────────────────────────────────────────────────────────
const openaiProvider = {
  id: "openai",
  model: envModel() || OPENAI_DEFAULT_MODEL,
  async answer({ system, user, history = [] }) {
    const apiKey = process.env.OPENAI_API_KEY || envKey();
    if (!apiKey) return { ok: false, error: "no_api_key", retryable: false };
    const messages = [{ role: "system", content: system }];
    for (const h of history) {
      messages.push({ role: h.role === "resident" ? "assistant" : "user", content: h.text });
    }
    messages.push({ role: "user", content: user });
    try {
      const res = await timedFetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "authorization": `Bearer ${apiKey}`,
          "content-type":  "application/json",
        },
        body: JSON.stringify({
          model:       this.model,
          max_tokens:  MAX_ANSWER_TOKENS,
          temperature: 0.7,
          messages,
        }),
      });
      if (!res.ok) {
        const status = res.status;
        const txt = await res.text().catch(() => "");
        return { ok: false, error: `openai_${status}`, detail: txt.slice(0, 200), retryable: status >= 500 || status === 429 };
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || "";
      if (!text) return { ok: false, error: "empty_response", retryable: true };
      return { ok: true, text, usage: data?.usage || null };
    } catch (e) {
      return { ok: false, error: e?.name === "AbortError" ? "timeout" : "network_error", detail: e?.message, retryable: true };
    }
  },
};

// ── Stub (no network) ────────────────────────────────────────────────
// Returns a plausible-looking deterministic reply, tagged with the provider
// so demos without API keys can still visibly exercise the "LLM answered"
// code path (separate from canned).
const stubProvider = {
  id: "stub",
  model: "stub-echo",
  async answer({ system, user }) {
    // Echo the question inside the persona's voice — so the demo still
    // feels consistent and the archive tags still populate.
    const personaCue = (system.match(/You are\s+([^.]+?)\.(?:\s|$)/i) || [])[1] || "your host";
    return {
      ok: true,
      text: `${personaCue} here — you asked "${user.slice(0, 120)}${user.length > 120 ? "…" : ""}". (Real-LLM answer would go here once LLM_API_KEY is set.)`,
      usage: null,
      stub: true,
    };
  },
};

const PROVIDERS = {
  anthropic: anthropicProvider,
  openai:    openaiProvider,
  stub:      stubProvider,
};

export const getActiveProvider = () => {
  const id = resolveProviderId();
  return PROVIDERS[id] || PROVIDERS.stub;
};

export const listProviders = () => Object.values(PROVIDERS).map((p) => ({ id: p.id, model: p.model }));

/** Low-level helper, mostly for tests. */
export const getProviderById = (id) => PROVIDERS[id] || null;

export const MAX_LLM_ANSWER_TOKENS = MAX_ANSWER_TOKENS;
