import { describe, it, expect, beforeEach } from "vitest";

// These tests target the LLM stub provider, the cost guards, and the
// canned-answer service indirection layer. They MUST not require any
// real network access — every test here works with no API keys.

beforeEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.LLM_API_KEY;
  delete process.env.CANNED_BANK_URL;
  process.env.LLM_PROVIDER = "stub";
});

describe("stub provider returns flavour answers, not echo glue", () => {
  it("does not include the 'Real-LLM answer would go here' demo string", async () => {
    const { answerAsResident } = await import("../llm/llmService.js");
    const r = await answerAsResident({
      residentId: "farah_hyd",
      userId:     "u_stub_a",
      userName:   "Alice",
      venueId:    "hyd_paradise_biryani",
      question:   "what makes the biryani special?",
    });
    expect(r.ok).toBe(true);
    expect(r.text).not.toMatch(/Real-LLM answer would go here/);
    expect(r.stub).toBe(true);
  });

  it("returns a line that exists in the resident's voice (defaultLines or fallback)", async () => {
    const { answerAsResident } = await import("../llm/llmService.js");
    const out = new Set();
    for (let i = 0; i < 10; i++) {
      const r = await answerAsResident({
        residentId: "farah_hyd",
        userId:     `u_stub_loop_${i}`,
        userName:   "Tester",
        venueId:    "hyd_paradise_biryani",
        question:   "anything",
      });
      out.add(r.text.replace(/^Farah:\s*/, ""));
    }
    // Each call returned a non-empty string
    for (const t of out) expect(typeof t === "string" && t.length > 0).toBe(true);
  });
});

describe("cost guards", () => {
  it("blocks at the per-minute request rate", async () => {
    const { canSpend, beginRequest } = await import("../llm/costGuards.js");
    // Burn through the per-minute cap (default 20)
    for (let i = 0; i < 25; i++) {
      const r = canSpend("u_burn", "farah_hyd");
      if (!r.ok) {
        expect(r.reason).toBe("per_minute");
        expect(typeof r.retryAfterMs).toBe("number");
        return;
      }
      beginRequest("u_burn", "farah_hyd")(0);
    }
    throw new Error("Per-minute cap should have triggered before 25 calls.");
  });

  it("blocks when a resident is at concurrency cap", async () => {
    const { canSpend, beginRequest } = await import("../llm/costGuards.js");
    // Open 2 concurrent requests for the same resident, never call done()
    beginRequest("u_a", "farah_hyd");
    beginRequest("u_b", "farah_hyd");
    const r = canSpend("u_c", "farah_hyd");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("resident_busy");
  });
});

describe("cannedAnswerService indirection", () => {
  it("returns a venue match for a known venue + relevant question", async () => {
    const { matchCanned } = await import("../cannedAnswerService.js");
    const r = await matchCanned({
      residentId: "farah_hyd",
      venueId:    "hyd_paradise_biryani",
      question:   "tell me about dum cooking",
    });
    expect(r).toBeTruthy();
    expect(typeof r.answer).toBe("string");
    expect(r.source).toMatch(/local-/); // local-resident OR local-venue
  });

  it("returns null when nothing matches", async () => {
    const { matchCanned } = await import("../cannedAnswerService.js");
    const r = await matchCanned({
      residentId: "farah_hyd",
      venueId:    "hyd_paradise_biryani",
      question:   "asfgkjasldkfjlasdkjfasldfk",
    });
    expect(r).toBeNull();
  });

  it("source label distinguishes resident-personal from venue-bank matches", async () => {
    const { matchCanned } = await import("../cannedAnswerService.js");
    // Zara is a regular at Paradise with her own personal bank for dum-cooking.
    const r = await matchCanned({
      residentId: "zara_hyd",
      venueId:    "hyd_paradise_biryani",
      question:   "how long does dum take?",
    });
    expect(r).toBeTruthy();
    expect(r.source).toBe("local-resident");
  });

  it("falls back to the venue bank for hosts (no personal QA registered)", async () => {
    const { matchCanned } = await import("../cannedAnswerService.js");
    const r = await matchCanned({
      residentId: "farah_hyd", // host, no personal QA
      venueId:    "hyd_paradise_biryani",
      question:   "what is paradise's history?",
    });
    expect(r).toBeTruthy();
    expect(r.source).toBe("local-venue");
  });
});
