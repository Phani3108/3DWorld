import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "conversationLog.json");
const clean = () => { try { if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE); } catch {} };

beforeEach(async () => {
  clean();
  const cl = await import("../conversationLog.js");
  cl._clearForTests();
});

const seed = async () => {
  const cl = await import("../conversationLog.js");
  cl.appendConversation({
    fromUserId: "user_a", fromName: "Alice",
    toBotId: "farah_hyd", venueId: "hyd_paradise_biryani",
    question: "what is dum cooking?", answer: "Slow-cooking in a sealed handi.",
    channel: "canned",
  });
  cl.appendConversation({
    fromUserId: "user_a", fromName: "Alice",
    toBotId: "nat_syd", venueId: "syd_barista_lab",
    question: "how do you pull a flat white?", answer: "1:2 ratio, 28 seconds.",
    channel: "canned",
  });
  cl.appendConversation({
    fromUserId: "user_b", fromName: "Bob",
    toBotId: "zara_hyd", venueId: "hyd_paradise_biryani",
    question: "kachche gosht timing?", answer: "Six hours marinate, dum 35.",
    channel: "canned",
  });
  return cl;
};

describe("appendConversation", () => {
  it("rejects missing required fields", async () => {
    const cl = await import("../conversationLog.js");
    expect(cl.appendConversation({ fromUserId: "x" })).toBeNull();
    expect(cl.appendConversation(null)).toBeNull();
  });

  it("auto-tags from resident expertise + venue type", async () => {
    const cl = await seed();
    const all = cl.listConversations({ limit: 10 });
    const farah = all.find((e) => e.toBotId === "farah_hyd");
    expect(farah.tags).toContain("biryani");
    expect(farah.tags).toContain("dum-cooking");
    expect(farah.tags).toContain("type:restaurant");
  });
});

describe("listConversations filters", () => {
  it("filters by tag", async () => {
    const cl = await seed();
    const out = cl.listConversations({ tag: "flat-white" });
    expect(out.length).toBe(1);
    expect(out[0].toBotId).toBe("nat_syd");
  });

  it("filters by city", async () => {
    const cl = await seed();
    expect(cl.listConversations({ city: "hyderabad" }).length).toBe(2);
    expect(cl.listConversations({ city: "sydney" }).length).toBe(1);
  });

  it("filters by venue", async () => {
    const cl = await seed();
    expect(cl.listConversations({ venue: "hyd_paradise_biryani" }).length).toBe(2);
  });

  it("filters by user (asker)", async () => {
    const cl = await seed();
    expect(cl.listConversations({ user: "user_a" }).length).toBe(2);
    expect(cl.listConversations({ user: "user_b" }).length).toBe(1);
  });

  it("filters by free-text q", async () => {
    const cl = await seed();
    expect(cl.listConversations({ q: "kachche" }).length).toBe(1);
    expect(cl.listConversations({ q: "ESPRESSO" }).length).toBe(0);
  });
});

describe("listConversationsForUser", () => {
  it("includes both asker and answerer matches", async () => {
    const cl = await seed();
    const aliceThreads = cl.listConversationsForUser("user_a");
    expect(aliceThreads.length).toBe(2);
    const zaraThreads = cl.listConversationsForUser("zara_hyd");
    expect(zaraThreads.length).toBe(1);
    expect(zaraThreads[0].fromUserId).toBe("user_b");
  });
});

describe("tagFrequencies", () => {
  it("aggregates tag counts across the archive", async () => {
    const cl = await seed();
    const freq = cl.tagFrequencies({ limit: 20 });
    const biryani = freq.find((f) => f.tag === "biryani");
    expect(biryani.count).toBe(2);
    const flat = freq.find((f) => f.tag === "flat-white");
    expect(flat.count).toBe(1);
  });

  it("respects the city filter", async () => {
    const cl = await seed();
    const sydneyOnly = cl.tagFrequencies({ city: "sydney" });
    expect(sydneyOnly.find((f) => f.tag === "biryani")).toBeUndefined();
  });
});
