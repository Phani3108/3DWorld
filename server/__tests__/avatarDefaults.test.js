import { describe, it, expect } from "vitest";
import {
  dicebearUrl,
  isDicebearUrl,
  DICEBEAR_BASE,
  DEFAULT_STYLE,
  RESIDENT_STYLE,
} from "../shared/avatarDefaults.js";
import { publicResident, RESIDENTS } from "../shared/residentCatalog.js";

describe("dicebearUrl", () => {
  it("returns null for empty seed", () => {
    expect(dicebearUrl("")).toBeNull();
    expect(dicebearUrl(null)).toBeNull();
    expect(dicebearUrl(undefined)).toBeNull();
  });

  it("returns the canonical 9.x personas URL by default", () => {
    expect(dicebearUrl("alice")).toBe(`${DICEBEAR_BASE}/${DEFAULT_STYLE}/svg?seed=alice`);
  });

  it("encodes seeds with special characters", () => {
    expect(dicebearUrl("user with space")).toContain("user%20with%20space");
    expect(dicebearUrl("résumé")).toContain("r%C3%A9sum%C3%A9");
  });

  it("respects an explicit style argument", () => {
    expect(dicebearUrl("alice", "lorelei")).toBe(`${DICEBEAR_BASE}/lorelei/svg?seed=alice`);
  });

  it("is deterministic — same seed produces the same URL", () => {
    expect(dicebearUrl("farah_hyd")).toBe(dicebearUrl("farah_hyd"));
  });
});

describe("isDicebearUrl", () => {
  it("recognises canonical dicebear URLs", () => {
    expect(isDicebearUrl(dicebearUrl("test"))).toBe(true);
  });

  it("rejects non-dicebear URLs", () => {
    expect(isDicebearUrl("/avatars/residents/farah_hyd.webp")).toBe(false);
    expect(isDicebearUrl("data:image/jpeg;base64,XYZ")).toBe(false);
    expect(isDicebearUrl(null)).toBe(false);
    expect(isDicebearUrl(undefined)).toBe(false);
  });
});

describe("publicResident — Phase 11A integration", () => {
  it("every resident has a non-null avatarPhotoUrl", () => {
    const missing = [];
    for (const r of Object.values(RESIDENTS)) {
      const proj = publicResident(r);
      if (!proj.avatarPhotoUrl) missing.push(r.id);
    }
    expect(missing).toEqual([]);
  });

  it("every resident's avatarPhotoUrl points at DiceBear", () => {
    for (const r of Object.values(RESIDENTS)) {
      const proj = publicResident(r);
      expect(isDicebearUrl(proj.avatarPhotoUrl), `${r.id}: ${proj.avatarPhotoUrl}`).toBe(true);
    }
  });

  it("uses the resident style for the URL", () => {
    const proj = publicResident(RESIDENTS.farah_hyd);
    expect(proj.avatarPhotoUrl).toContain(`/${RESIDENT_STYLE}/svg`);
  });

  it("seed is the resident id (deterministic)", () => {
    const proj = publicResident(RESIDENTS.farah_hyd);
    expect(proj.avatarPhotoUrl).toMatch(/seed=farah_hyd$/);
  });
});
