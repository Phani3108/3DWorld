import type { LocalPoint } from "@3dworld/contracts";
import type { CityStyle } from "./cityStyle.ts";
import { hash01, rng } from "./look.ts";

export type Box = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rot: number;
  colour: string;
};
export type Strip = { x: number; z: number; length: number; width: number; rot: number };

/**
 * Seeded street grid + building lots around the district origin. A stand-in
 * for real OpenStreetMap geometry: same inputs → same city every visit.
 */
export const generateStandIn = (opts: {
  seed: string;
  radius: number;
  style: CityStyle;
  /** Keep these spots clear (places, spawn) — metres. */
  clear: Array<LocalPoint & { r: number }>;
}) => {
  const { radius, style } = opts;
  const rand = rng(Math.floor(hash01(opts.seed) * 1e9));
  const angle = rand() * (Math.PI / 2);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const toWorld = (u: number, v: number) => ({ x: u * cos - v * sin, z: u * sin + v * cos });

  const block = 70 + rand() * 30;
  const roadWide = 12;
  const roadNarrow = 7;
  const walk = 3;
  const extent = radius + 60;
  const lines: number[] = [];
  for (let u = -Math.ceil(extent / block) * block; u <= extent; u += block)
    lines.push(u + (rand() - 0.5) * 8);

  const roads: Strip[] = [];
  const sidewalks: Strip[] = [];
  lines.forEach((u, i) => {
    const width = i % 3 === 0 ? roadWide : roadNarrow;
    for (const vertical of [true, false]) {
      const c = vertical ? toWorld(u, 0) : toWorld(0, u);
      const rot = vertical ? -angle : -angle + Math.PI / 2;
      roads.push({ x: c.x, z: c.z, length: extent * 2, width, rot });
      for (const side of [-1, 1]) {
        const off = side * (width / 2 + walk / 2);
        const s = vertical ? toWorld(u + off, 0) : toWorld(0, u + off);
        sidewalks.push({ x: s.x, z: s.z, length: extent * 2, width: walk, rot });
      }
    }
  });

  const isClear = (p: LocalPoint, margin: number) =>
    opts.clear.every((c) => Math.hypot(p.x - c.x, p.z - c.z) > c.r + margin);

  const buildings: Box[] = [];
  for (let i = 0; i < lines.length - 1; i++) {
    for (let j = 0; j < lines.length - 1; j++) {
      const u0 = lines[i]! + roadWide / 2 + walk + 1;
      const u1 = lines[i + 1]! - roadWide / 2 - walk - 1;
      const v0 = lines[j]! + roadWide / 2 + walk + 1;
      const v1 = lines[j + 1]! - roadWide / 2 - walk - 1;
      if (u1 - u0 < 12 || v1 - v0 < 12) continue;
      const centre = toWorld((u0 + u1) / 2, (v0 + v1) / 2);
      if (Math.hypot(centre.x, centre.z) > radius) continue;
      if (rand() < 0.06) continue; // an open lot or courtyard
      // Perimeter lots: a row along each of the four block edges.
      const depth = Math.min(16 + rand() * 6, (v1 - v0) / 2 - 1, (u1 - u0) / 2 - 1);
      const rows: Array<[number, number, number, number, boolean]> = [
        [u0, u1, v0, v0 + depth, true],
        [u0, u1, v1 - depth, v1, true],
        [u0, u0 + depth, v0 + depth, v1 - depth, false],
        [u1 - depth, u1, v0 + depth, v1 - depth, false],
      ];
      for (const [a0, a1, b0, b1, alongU] of rows) {
        let cursor = alongU ? a0 : b0;
        const end = alongU ? a1 : b1;
        while (end - cursor > 6) {
          const frontage = Math.min(end - cursor, 8 + rand() * 14);
          const cu = alongU ? cursor + frontage / 2 : (a0 + a1) / 2;
          const cv = alongU ? (b0 + b1) / 2 : cursor + frontage / 2;
          const w = alongU ? frontage - 0.6 : a1 - a0;
          const d = alongU ? b1 - b0 : frontage - 0.6;
          const p = toWorld(cu, cv);
          cursor += frontage;
          if (!isClear(p, Math.max(w, d) / 2)) continue;
          const [lo, hi] = style.floors;
          let floors = lo + Math.floor(rand() * (hi - lo + 1));
          if (rand() < style.towers) floors *= 4 + Math.floor(rand() * 7);
          buildings.push({
            x: p.x,
            z: p.z,
            w,
            d,
            h: floors * style.floorHeight + rand() * 0.8,
            rot: -angle,
            colour: style.facades[Math.floor(rand() * style.facades.length)]!,
          });
        }
      }
    }
  }
  return { roads, sidewalks, buildings, angle };
};
