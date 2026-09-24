import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildClaudeRequest,
  getProviderById,
  __setClaudeClient,
  __resetClaudeFeatures,
  claudeFeatures,
} from "../llm/providerCatalog.js";
import { buildSystemBlocks, buildLiveContext, WORLD_BIBLE } from "../llm/promptBuilder.js";
import { getResident } from "../shared/residentCatalog.js";
import { costOfUsage } from "../llm/pricing.js";
import { __resetCostGuards } from "../llm/costGuards.js";

// No network: every test drives the provider through a fake SDK client.

const farah = getResident("farah_hyd");

const baseArgs = () => ({
  system: buildSystemBlocks(farah),
  messages: [{ role: "user", content: "Why does dum take so long?" }],
  liveContext: buildLiveContext({ resident: farah, visitorName: "Maya", priorTurns: 0 }),
});

const fakeMessage = (overrides = {}) => ({
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-opus-5-5",
  content: [
    { type: "thinking", thinking: "", signature: "sig" },
    { type: "text", text: "Aadab! Thirty-five minutes, sahab — patience is the spice." },
  ],
  stop_reason: "end_turn",
  stop_details: null,
  usage: { input_tokens: 120, output_tokens: 80, cache_read_input_tokens: 1800, cache_creation_input_tokens: 0 },
  ...overrides,
});

const fakeClient = (impl) => {
  const calls = [];
  return {
    calls,
    beta: {
      messages: {
        create: async (req) => {
          calls.push(structuredClone(req));
          return impl(req, calls.length);
        },
      },
    },
  };
};

const badRequest = (message) =>
  new Anthropic.BadRequestError(400, { type: "error", error: { type: "invalid_request_error", message } }, undefined, new Headers());

beforeEach(() => {
  __resetClaudeFeatures();
  __resetCostGuards();
  delete process.env.LLM_MODEL;
  delete process.env.LLM_EFFORT;
});
afterEach(() => {
  __setClaudeClient(null);
  process.env.LLM_PROVIDER = "stub";
});

describe("Claude request shape (Opus 5.5)", () => {
  it("targets claude-opus-5-5 at low effort with no thinking or sampling params", () => {
    const req = buildClaudeRequest(baseArgs());
    expect(req.model).toBe("claude-opus-5-5");
    expect(req.output_config).toEqual({ effort: "low" });
    expect(req).not.toHaveProperty("thinking");
    expect(req).not.toHaveProperty("temperature");
    expect(req).not.toHaveProperty("tool_choice");
    // Thinking counts toward max_tokens, so the cap must leave headroom.
    expect(req.max_tokens).toBeGreaterThanOrEqual(2048);
  });

  it("honours LLM_MODEL / LLM_EFFORT overrides", () => {
    process.env.LLM_MODEL = "claude-opus-5";
    process.env.LLM_EFFORT = "medium";
    const req = buildClaudeRequest(baseArgs());
    expect(req.model).toBe("claude-opus-5");
    expect(req.output_config.effort).toBe("medium");
  });

  it("caches the shared world bible (1h) before the per-resident card (5m)", () => {
    const req = buildClaudeRequest(baseArgs());
    expect(req.system).toHaveLength(2);
    expect(req.system[0].text).toBe(WORLD_BIBLE);
    expect(req.system[0].cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
    expect(req.system[1].cache_control).toEqual({ type: "ephemeral" });
  });

  it("keeps volatile context out of the cached system blocks", () => {
    const req = buildClaudeRequest(baseArgs());
    const cached = req.system.map((b) => b.text).join("\n");
    expect(cached).not.toContain("Maya");
    expect(cached).not.toMatch(/Live context:/);
    expect(cached).not.toMatch(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d{2}:\d{2}\b/);
  });

  it("sends live context as a trailing mid-conversation system message", () => {
    const req = buildClaudeRequest(baseArgs());
    expect(req.messages.at(-2).role).toBe("user");
    expect(req.messages.at(-1).role).toBe("system");
    expect(req.messages.at(-1).content).toMatch(/local time in Hyderabad/);
  });

  it("opts into server-side refusal fallbacks", () => {
    const req = buildClaudeRequest(baseArgs());
    expect(req.fallbacks).toBe("default");
    expect(req.betas).toContain("server-side-fallback-2026-07-01");
  });
});

describe("Claude provider responses", () => {
  it("returns the text blocks and usage", async () => {
    __setClaudeClient(fakeClient(() => fakeMessage()));
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r.ok).toBe(true);
    expect(r.text).toBe("Aadab! Thirty-five minutes, sahab — patience is the spice.");
    expect(r.usage.cache_read_input_tokens).toBe(1800);
    expect(r.model).toBe("claude-opus-5-5");
  });

  it("maps a safety refusal to ok:false with its category", async () => {
    __setClaudeClient(fakeClient(() =>
      fakeMessage({ content: [], stop_reason: "refusal", stop_details: { type: "refusal", category: "bio", explanation: "x" } }),
    ));
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r).toMatchObject({ ok: false, error: "refusal", category: "bio" });
  });

  it("treats a reply cut off before any text as a failure", async () => {
    __setClaudeClient(fakeClient(() =>
      fakeMessage({ content: [{ type: "thinking", thinking: "", signature: "s" }], stop_reason: "max_tokens" }),
    ));
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r).toMatchObject({ ok: false, error: "max_tokens" });
  });

  it("drops the fallbacks beta and retries once when the API rejects it", async () => {
    const client = fakeClient((req, n) => {
      if (n === 1) throw badRequest("fallbacks: Extra inputs are not permitted");
      return fakeMessage();
    });
    __setClaudeClient(client);
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r.ok).toBe(true);
    expect(client.calls).toHaveLength(2);
    expect(client.calls[1]).not.toHaveProperty("fallbacks");
    expect(claudeFeatures().fallbacks).toBe(false);
    // Mid-conversation system messages weren't implicated, so they stay.
    expect(client.calls[1].messages.at(-1).role).toBe("system");
  });

  it("folds live context into the user turn if system-role messages are rejected", async () => {
    const client = fakeClient((req, n) => {
      if (n === 1) throw badRequest("messages: role 'system' is not supported on this model");
      return fakeMessage();
    });
    __setClaudeClient(client);
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r.ok).toBe(true);
    const last = client.calls[1].messages.at(-1);
    expect(last.role).toBe("user");
    expect(last.content).toContain("<world_context>");
  });

  it("never throws on transport errors", async () => {
    __setClaudeClient(fakeClient(() => { throw new Anthropic.APIConnectionError({ message: "down" }); }));
    const r = await getProviderById("anthropic").answer(baseArgs());
    expect(r).toMatchObject({ ok: false, error: "network_error", retryable: true });
  });
});

describe("answerAsResident end-to-end (fake Claude)", () => {
  it("replays history, appends live context, prices the turn", async () => {
    process.env.LLM_PROVIDER = "anthropic";
    const client = fakeClient(() => fakeMessage());
    __setClaudeClient(client);
    const { answerAsResident } = await import("../llm/llmService.js");

    const first = await answerAsResident({ residentId: "zara_hyd", userId: "u_e2e_zara", userName: "Maya", question: "How long is dum?" });
    expect(first.ok).toBe(true);
    expect(first.costUsd).toBeGreaterThan(0);

    await answerAsResident({ residentId: "zara_hyd", userId: "u_e2e_zara", userName: "Maya", question: "And the saffron?" });
    const second = client.calls[1];
    expect(second.messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "system"]);
    expect(second.system[1].text).toContain("You are Zara, a regular");
    expect(second.messages.at(-1).content).toMatch(/spoken before/);
  });
});

describe("pricing", () => {
  it("prices Opus 5.5 input, output, cache reads and both cache-write TTLs", () => {
    expect(costOfUsage({ input_tokens: 1_000_000 }, "claude-opus-5-5")).toBeCloseTo(4);
    expect(costOfUsage({ output_tokens: 1_000_000, cache_read_input_tokens: 1_000_000 }, "claude-opus-5-5")).toBeCloseTo(20.2);
    expect(costOfUsage({
      cache_creation_input_tokens: 2_000_000,
      cache_creation: { ephemeral_1h_input_tokens: 1_000_000, ephemeral_5m_input_tokens: 1_000_000 },
    }, "claude-opus-5-5")).toBeCloseTo(13);
    expect(costOfUsage(null, "claude-opus-5-5")).toBe(0);
  });
});
