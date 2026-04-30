import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// Use a unique state file per test run so we don't collide with the live
// userQuests.json. We mutate process.cwd() data files via the service's
// own persist; cleanup with afterAll.
const QUEST_STATE_FILE = path.join(process.cwd(), "userQuests.json");

const cleanState = () => {
  try { if (fs.existsSync(QUEST_STATE_FILE)) fs.unlinkSync(QUEST_STATE_FILE); } catch {}
};

// We import lazily inside each test so fresh module state lines up with
// the freshly-cleaned file.
const importFresh = async () => {
  // Vitest runs each test file in its own worker, so module cache is
  // already isolated; explicit fresh-import isn't strictly needed but
  // makes intent clear.
  return await import("../questService.js");
};

beforeEach(() => cleanState());

describe("acceptQuest", () => {
  it("rejects unknown quest ids", async () => {
    const qs = await importFresh();
    const r = qs.acceptQuest("u_test_a", "totally_made_up");
    expect(r.ok).toBe(false);
    expect(r.error).toBe("quest_not_found");
  });

  it("accepts a real quest and surfaces it as active", async () => {
    const qs = await importFresh();
    const a = qs.acceptQuest("u_test_b", "farah_biryani_mission");
    expect(a.ok).toBe(true);
    const list = qs.listUserQuests("u_test_b");
    expect(list.active.find((q) => q.id === "farah_biryani_mission")).toBeTruthy();
  });

  it("rejects double-accepting the same quest", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_test_c", "farah_biryani_mission");
    const second = qs.acceptQuest("u_test_c", "farah_biryani_mission");
    expect(second.ok).toBe(false);
    expect(second.error).toBe("already_active");
  });
});

describe("tickEvent", () => {
  it("ignores events that don't match the goal type", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_test_d", "farah_biryani_mission"); // ask_tag / dum-cooking
    qs.tickEvent("u_test_d", { type: "visit_venue", target: "hyd_paradise_biryani" });
    const list = qs.listUserQuests("u_test_d");
    expect(list.active[0].progress).toBe(0);
    expect(list.completed.length).toBe(0);
  });

  it("ignores events with a different target", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_test_e", "farah_biryani_mission");
    qs.tickEvent("u_test_e", { type: "ask_tag", target: "kopi-codes" });
    const list = qs.listUserQuests("u_test_e");
    expect(list.active[0].progress).toBe(0);
  });

  it("completes the quest and removes it from active", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_test_f", "farah_biryani_mission");
    const completed = qs.tickEvent("u_test_f", { type: "ask_tag", target: "dum-cooking" });
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe("farah_biryani_mission");
    const list = qs.listUserQuests("u_test_f");
    expect(list.active.length).toBe(0);
    expect(list.completed.find((q) => q.id === "farah_biryani_mission")).toBeTruthy();
  });

  it("never re-completes a finished quest", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_test_g", "farah_biryani_mission");
    qs.tickEvent("u_test_g", { type: "ask_tag", target: "dum-cooking" });
    const second = qs.tickEvent("u_test_g", { type: "ask_tag", target: "dum-cooking" });
    expect(second.length).toBe(0);
  });

  it("handles a no-op for empty user", async () => {
    const qs = await importFresh();
    const out = qs.tickEvent("u_never_accepted", { type: "ask_tag", target: "biryani" });
    expect(out.length).toBe(0);
  });
});

describe("listUserQuests projection", () => {
  it("returns the full catalog as offers when nothing accepted", async () => {
    const qs = await importFresh();
    const list = qs.listUserQuests("u_fresh");
    expect(list.active.length).toBe(0);
    expect(list.completed.length).toBe(0);
    expect(list.offers.length).toBeGreaterThan(0);
    // Every offer carries the catalog metadata
    for (const o of list.offers) {
      expect(o.id).toBeTruthy();
      expect(o.title).toBeTruthy();
      expect(o.giverId).toBeTruthy();
    }
  });

  it("excludes accepted quests from the offers list", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_offers", "farah_biryani_mission");
    const list = qs.listUserQuests("u_offers");
    expect(list.offers.find((q) => q.id === "farah_biryani_mission")).toBeUndefined();
  });
});

describe("questCounts", () => {
  it("reports active + completed counts correctly", async () => {
    const qs = await importFresh();
    qs.acceptQuest("u_counts", "farah_biryani_mission");
    qs.acceptQuest("u_counts", "asad_irani_mission");
    qs.tickEvent("u_counts", { type: "ask_tag", target: "dum-cooking" });
    const c = qs.questCounts("u_counts");
    expect(c.active).toBe(1);
    expect(c.completed).toBe(1);
  });
});
