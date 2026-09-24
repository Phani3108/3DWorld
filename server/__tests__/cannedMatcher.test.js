import { describe, it, expect } from "vitest";
import { matchBank, tokenize } from "../shared/cannedMatcher.js";
import { getVenue, matchCannedAnswer } from "../shared/venueCatalog.js";
import { matchResidentCannedAnswer } from "../shared/residentQA.js";

const ask = (venueId, q) => matchCannedAnswer(getVenue(venueId), q);

describe("curated-bank matcher", () => {
  // Each of these used to return a confidently wrong answer via substring
  // hits on keywords like "it", "7", "and", "the"→"weather", "how".
  it.each([
    ["blr_mtr", "What city is this?"],
    ["nyc_bodega", "Who won the 1997 World Series?"],
    ["syd_bondi_chippery", "I understand. Thanks!"],
    ["hyd_niloufer_cafe", "Who is the current Nizam?"],
    ["hyd_paradise_biryani", "How is the weather today?"],
    ["blr_mtr", "how long does dum take?"],
  ])("%s: %j → no match", (venueId, q) => {
    expect(ask(venueId, q)).toBeNull();
  });

  it("still finds the right answer for real questions", () => {
    expect(ask("hyd_paradise_biryani", "tell me about dum cooking")?.answer).toMatch(/sealed pot/);
    expect(ask("hyd_paradise_biryani", "what is paradise's history?")?.answer).toMatch(/1953/);
    expect(ask("blr_mtr", "what makes the filter coffee special?")?.answer).toMatch(/Tumbler/);
    expect(matchResidentCannedAnswer("zara_hyd", "how long does dum take?")?.answer).toMatch(/Thirty-five minutes/);
  });

  it("matches phrases as whole words and simple word forms", () => {
    const bank = [
      { keywords: ["how long"], answer: "A" },
      { keywords: ["cook"], answer: "B" },
    ];
    expect(matchBank(bank, "How long is the queue?")?.answer).toBe("A");
    expect(matchBank(bank, "Who is cooking tonight?")?.answer).toBe("B");
    expect(matchBank(bank, "How do you do?")).toBeNull();
  });

  it("tokenizes accents and non-Latin scripts", () => {
    expect(tokenize("Café Niloufer — chai?")).toEqual(["cafe", "niloufer", "chai"]);
    expect(tokenize("हैदराबादी biryani")).toEqual(["हैदराबादी", "biryani"]);
    expect(tokenize("مرحبا habibi")).toEqual(["مرحبا", "habibi"]);
  });

  it("ignores prototype keys", () => {
    expect(matchResidentCannedAnswer("__proto__", "dum")).toBeNull();
  });
});
