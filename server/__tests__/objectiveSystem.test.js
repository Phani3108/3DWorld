import { describe, it, expect } from "vitest";
import {
  initObjectives,
  checkBondMilestones,
  objectivesPayload,
  cleanupObjectives,
} from "../objectiveSystem.js";

describe("objectiveSystem", () => {
  it("initObjectives returns bond milestones", () => {
    const state = initObjectives("s1");
    expect(state.bondMilestones).toHaveLength(5);
    expect(state.bondMilestones.every((m) => !m.completed)).toBe(true);
  });

  it("checkBondMilestones completes cumulative milestones", () => {
    initObjectives("s2");
    const newly = checkBondMilestones("s2", 3);
    expect(newly.length).toBe(3); // levels 1, 2, 3
    expect(newly.map((n) => n.id)).toEqual(
      expect.arrayContaining(["bond_1", "bond_2", "bond_3"])
    );
  });

  it("does not double-complete milestones", () => {
    initObjectives("s3");
    checkBondMilestones("s3", 2);
    const second = checkBondMilestones("s3", 2);
    expect(second).toHaveLength(0);
  });

  it("objectivesPayload returns structured data", () => {
    initObjectives("s4");
    const payload = objectivesPayload("s4");
    expect(payload).toHaveProperty("bondMilestones");
    expect(payload).toHaveProperty("dailies");
    expect(payload).toHaveProperty("roomGoals");
  });

  it("cleanupObjectives removes state", () => {
    initObjectives("s5");
    cleanupObjectives("s5");
    expect(objectivesPayload("s5")).toBeNull();
  });
});
