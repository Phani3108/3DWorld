/**
 * LLM providers.
 *
 *   • "anthropic" — Claude through the official SDK (default model
 *                   claude-opus-5-5).
 *   • "stub"      — no network; answers from the resident's own lines.
 *                   Used by tests and when no API key is configured.
 *
 * Selection: LLM_PROVIDER=anthropic|stub, otherwise "anthropic" when
 * ANTHROPIC_API_KEY (or LLM_API_KEY) is set, else "stub".
 * Tuning: LLM_MODEL (default claude-opus-5-5), LLM_EFFORT (default low).
 *
 * `answer()` never throws: callers always get { ok: true, ... } or
 * { ok: false, error, retryable }.
 *
 * Opus 5.5 notes that shape the request:
 *   • Thinking is always on and can't be disabled; `output_config.effort`
 *     is the latency/cost dial. Chat runs at "low".
 *   • Thinking tokens count toward max_tokens, so the cap leaves headroom
 *     even though replies are ~80 words.
 *   • Sampling params (temperature etc.), prefill and forced tool_choice
 *     are rejected — none are sent.
 *   • A safety decline arrives as stop_reason "refusal"; server-side
 *     `fallbacks: "default"` re-runs declined requests on a fallback model.
 */

import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_DEFAULT_MODEL = "claude-opus-5-5";
const EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"];
const DEFAULT_EFFORT = "low";
const DEFAULT_MAX_TOKENS = 4096;
const REQUEST_TIMEOUT_MS = 45_000;
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

const apiKey = () => process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY || "";

export const configuredModel = () => process.env.LLM_MODEL || CLAUDE_DEFAULT_MODEL;

export const configuredEffort = () => {
  const e = String(process.env.LLM_EFFORT || "").toLowerCase();
  return EFFORT_LEVELS.includes(e) ? e : DEFAULT_EFFORT;
};

const resolveProviderId = () => {
  const raw = String(process.env.LLM_PROVIDER || "").toLowerCase();
  if (raw === "anthropic" || raw === "stub") return raw;
  return apiKey() ? "anthropic" : "stub";
};

// Optional request features. If the API rejects one with a 400 we drop it
// for the rest of the process and retry once: a missing beta should
// degrade residents, not take them offline.
const features = { fallbacks: true, midConversationSystem: true };

let sdkClient = null;
const getClient = () => {
  if (!sdkClient) {
    sdkClient = new Anthropic({
      apiKey: apiKey() || undefined,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
  }
  return sdkClient;
};

/** Test hooks: inject a fake SDK client / reset downgraded features. */
export const __setClaudeClient = (client) => { sdkClient = client; };
export const __resetClaudeFeatures = () => {
  features.fallbacks = true;
  features.midConversationSystem = true;
};
export const claudeFeatures = () => ({ ...features });

const withLiveContext = (messages, liveContext) => {
  if (!liveContext) return messages;
  if (features.midConversationSystem) {
    // Mid-conversation system message: operator-authority context that sits
    // after the cached prefix. Must follow a user turn and end the list.
    return [...messages, { role: "system", content: liveContext }];
  }
  const last = messages[messages.length - 1];
  const folded = `${last.content}\n\n<world_context>\n${liveContext}\n</world_context>`;
  return [...messages.slice(0, -1), { role: "user", content: folded }];
};

export const buildClaudeRequest = ({ system, messages, liveContext, model, effort, maxTokens }) => {
  const req = {
    model: model || configuredModel(),
    max_tokens: maxTokens || DEFAULT_MAX_TOKENS,
    output_config: { effort: effort || configuredEffort() },
    system,
    messages: withLiveContext(messages, liveContext),
  };
  if (features.fallbacks) {
    req.betas = [FALLBACK_BETA];
    req.fallbacks = "default";
  }
  return req;
};

const textOf = (message) =>
  (message?.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

/** Drop whichever optional feature a 400 names; false if none applied. */
const downgradeFor = (err) => {
  const msg = String(err?.message || "").toLowerCase();
  let changed = false;
  if (features.fallbacks && msg.includes("fallback")) { features.fallbacks = false; changed = true; }
  if (features.midConversationSystem && (msg.includes("role") || msg.includes("system"))) {
    features.midConversationSystem = false;
    changed = true;
  }
  if (!changed && (features.fallbacks || features.midConversationSystem)) {
    // Unrecognised 400: shed both optional features once before giving up.
    features.fallbacks = false;
    features.midConversationSystem = false;
    changed = true;
  }
  return changed;
};

const errorEnvelope = (err) => {
  if (err instanceof Anthropic.AuthenticationError) return { ok: false, error: "auth", retryable: false };
  if (err instanceof Anthropic.RateLimitError) return { ok: false, error: "rate_limited", retryable: true };
  if (err instanceof Anthropic.APIConnectionTimeoutError) return { ok: false, error: "timeout", retryable: true };
  if (err instanceof Anthropic.APIConnectionError) return { ok: false, error: "network_error", retryable: true };
  if (err instanceof Anthropic.APIError) {
    return { ok: false, error: `anthropic_${err.status ?? "error"}`, detail: err.message, retryable: (err.status ?? 500) >= 500 };
  }
  return { ok: false, error: "exception", detail: err?.message, retryable: false };
};

const anthropicProvider = {
  id: "anthropic",
  get model() { return configuredModel(); },
  /**
   * @param {{ system: object[], messages: object[], liveContext?: string,
   *           effort?: string, maxTokens?: number }} args
   */
  async answer(args) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let message;
      try {
        message = await getClient().beta.messages.create(buildClaudeRequest(args));
      } catch (err) {
        if (attempt === 0 && err instanceof Anthropic.BadRequestError && downgradeFor(err)) {
          console.warn("[llm] request rejected, retrying without optional features:", err.message);
          continue;
        }
        const env = errorEnvelope(err);
        console.warn(`[llm] ${env.error}${env.detail ? `: ${env.detail}` : ""}`);
        return env;
      }
      const base = { usage: message.usage || null, model: message.model, stopReason: message.stop_reason };
      if (message.stop_reason === "refusal") {
        return { ok: false, error: "refusal", category: message.stop_details?.category ?? null, retryable: false, ...base };
      }
      const text = textOf(message);
      if (!text) return { ok: false, error: message.stop_reason === "max_tokens" ? "max_tokens" : "empty_response", retryable: false, ...base };
      return { ok: true, text, ...base };
    }
    return { ok: false, error: "exhausted", retryable: false };
  },
};

// ── Stub (no network) ────────────────────────────────────────────────
// Speaks one of the resident's own lines so stubbed answers still sound
// like them. The live Ask route never uses the stub for visitors — when
// no key is configured it serves the curated canned banks instead.
const STUB_FALLBACK_LINES = [
  "Tell me more — I love this kind of question.",
  "Funny you ask. Sit down for a minute.",
  "Good question, friend. Let me think.",
];

const stubProvider = {
  id: "stub",
  model: "stub-default-lines",
  async answer({ persona } = {}) {
    const lines = persona?.defaultLines?.length ? persona.defaultLines : STUB_FALLBACK_LINES;
    const text = lines[Math.floor(Math.random() * lines.length)];
    return { ok: true, text, usage: null, model: "stub-default-lines", stub: true };
  },
};

const PROVIDERS = { anthropic: anthropicProvider, stub: stubProvider };

export const getActiveProvider = () => PROVIDERS[resolveProviderId()] || stubProvider;

export const listProviders = () => Object.values(PROVIDERS).map((p) => ({ id: p.id, model: p.model }));

export const getProviderById = (id) => PROVIDERS[id] || null;
