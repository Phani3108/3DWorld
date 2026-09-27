import type { DistrictGeometry, RoadKind } from "@3dworld/contracts";
import { BufferAttribute, BufferGeometry, Color, ShapeUtils, Vector2 } from "three";

/** Growable flat arrays → one BufferGeometry (one draw call per material). */
class Builder {
  pos: number[] = [];
  nor: number[] = [];
  col: number[] = [];
  private colour = new Color();

  tri(a: number[], b: number[], c: number[], n: number[], colour?: string) {
    this.pos.push(...a, ...b, ...c);
    this.nor.push(...n, ...n, ...n);
    if (colour) {
      this.colour.set(colour);
      for (let i = 0; i < 3; i++) this.col.push(this.colour.r, this.colour.g, this.colour.b);
    }
  }

  quad(a: number[], b: number[], c: number[], d: number[], n: number[], colour?: string) {
    this.tri(a, b, c, n, colour);
    this.tri(a, c, d, n, colour);
  }

  build() {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute("normal", new BufferAttribute(new Float32Array(this.nor), 3));
    if (this.col.length)
      g.setAttribute("color", new BufferAttribute(new Float32Array(this.col), 3));
    g.computeBoundingSphere();
    return g;
  }
}

const UP = [0, 1, 0];

/** Flat ribbon along a polyline with round joins, at height y. */
const ribbon = (b: Builder, pts: number[], half: number, y: number) => {
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i]!;
    const az = pts[i + 1]!;
    const bx = pts[i + 2]!;
    const bz = pts[i + 3]!;
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.01) continue;
    const nx = (-(bz - az) / len) * half;
    const nz = ((bx - ax) / len) * half;
    b.quad(
      [ax + nx, y, az + nz],
      [bx + nx, y, bz + nz],
      [bx - nx, y, bz - nz],
      [ax - nx, y, az - nz],
      UP,
    );
  }
  // Round joins (and caps) so bends don't show wedges.
  const SEG = 10;
  for (let i = 0; i < pts.length; i += 2) {
    const cx = pts[i]!;
    const cz = pts[i + 1]!;
    for (let k = 0; k < SEG; k++) {
      const a0 = (k / SEG) * Math.PI * 2;
      const a1 = ((k + 1) / SEG) * Math.PI * 2;
      b.tri(
        [cx, y, cz],
        [cx + Math.cos(a1) * half, y, cz + Math.sin(a1) * half],
        [cx + Math.cos(a0) * half, y, cz + Math.sin(a0) * half],
        UP,
      );
    }
  }
};

const VEHICULAR = new Set<RoadKind>([
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "residential",
  "living_street",
  "service",
  "unclassified",
]);

export const isVehicular = (k: RoadKind) => VEHICULAR.has(k);

/** Asphalt, paving (pedestrian ways) and raised sidewalks along vehicular streets. */
export const buildStreets = (g: DistrictGeometry) => {
  const asphalt = new Builder();
  const paving = new Builder();
  const sidewalk = new Builder();
  for (const r of g.roads) {
    if (isVehicular(r.kind)) {
      ribbon(sidewalk, r.pts, r.width / 2 + 2.2, 0.12);
      ribbon(asphalt, r.pts, r.width / 2, 0.15);
    } else {
      ribbon(paving, r.pts, r.width / 2, 0.16);
    }
  }
  return { asphalt: asphalt.build(), paving: paving.build(), sidewalk: sidewalk.build() };
};

const signedArea = (ring: number[]) => {
  let a = 0;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    a += ring[j]! * ring[i + 1]! - ring[i]! * ring[j + 1]!;
  }
  return a / 2;
};

/**
 * Extruded buildings: walls + flat roofs (+ soffits for raised gateways), with
 * per-building vertex colours. One merged geometry → one draw call.
 */
export const buildBuildings = (
  g: DistrictGeometry,
  palette: string[],
  named: Record<string, string> = {},
) => {
  const b = new Builder();
  for (const bld of g.buildings) {
    if (bld.landmark) continue;
    const ring = bld.ring;
    const n = ring.length / 2;
    if (n < 3) continue;
    // Walk every ring counter-clockwise in (x, z) maths orientation, so the
    // right-hand normal (dz, -dx) of each edge points outward.
    const mathCcw = signedArea(ring) > 0;
    const colour = (bld.name && named[bld.name]) || palette[Math.abs(bld.id) % palette.length]!;
    const top = bld.h;
    const bottom = bld.minH ?? 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const [i0, i1] = mathCcw ? [i, j] : [j, i];
      const ax = ring[i0 * 2]!;
      const az = ring[i0 * 2 + 1]!;
      const bx = ring[i1 * 2]!;
      const bz = ring[i1 * 2 + 1]!;
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const normal = [(bz - az) / len, 0, -(bx - ax) / len];
      b.quad([ax, bottom, az], [ax, top, az], [bx, top, bz], [bx, bottom, bz], normal, colour);
    }
    const contour = Array.from(
      { length: n },
      (_, i) => new Vector2(ring[i * 2]!, ring[i * 2 + 1]!),
    );
    const faces = ShapeUtils.triangulateShape(contour, []);
    for (const [a, c, d] of faces) {
      const pa = contour[a!]!;
      const pc = contour[c!]!;
      const pd = contour[d!]!;
      // Winding for an upward-facing roof in three's right-handed frame.
      const cross = (pc.x - pa.x) * (pd.y - pa.y) - (pc.y - pa.y) * (pd.x - pa.x);
      const [p1, p2] = cross > 0 ? [pd, pc] : [pc, pd];
      b.tri([pa.x, top, pa.y], [p1.x, top, p1.y], [p2.x, top, p2.y], UP, colour);
      if (bottom > 0)
        b.tri([pa.x, bottom, pa.y], [p2.x, bottom, p2.y], [p1.x, bottom, p1.y], [0, -1, 0], colour);
    }
  }
  return b.build();
};

/** Centre and orientation of a footprint (for placing hand-built landmarks). */
export const footprintFrame = (ring: number[]) => {
  const n = ring.length / 2;
  let cx = 0;
  let cz = 0;
  for (let i = 0; i < n; i++) {
    cx += ring[i * 2]!;
    cz += ring[i * 2 + 1]!;
  }
  cx /= n;
  cz /= n;
  // Longest edge sets the orientation (mod 90° for square plans).
  let best = 0;
  let angle = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = ring[j * 2]! - ring[i * 2]!;
    const dz = ring[j * 2 + 1]! - ring[i * 2 + 1]!;
    const len = Math.hypot(dx, dz);
    if (len > best) {
      best = len;
      angle = Math.atan2(dz, dx);
    }
  }
  return { x: cx, z: cz, yaw: -angle };
};

/** Street lamps along vehicular streets: alternating kerbs, every `spacing` metres, never on a carriageway. */
export const lampsForStreets = (g: DistrictGeometry, spacing = 30) => {
  const segs: Array<[number, number, number, number, number]> = [];
  for (const r of g.roads) {
    if (!isVehicular(r.kind) && r.kind !== "pedestrian") continue;
    for (let i = 0; i + 3 < r.pts.length; i += 2) {
      segs.push([r.pts[i]!, r.pts[i + 1]!, r.pts[i + 2]!, r.pts[i + 3]!, r.width / 2]);
    }
  }
  const onCarriageway = (x: number, z: number) =>
    segs.some(([ax, az, bx, bz, half]) => {
      const dx = bx - ax;
      const dz = bz - az;
      const len2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
      return Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < half + 0.3;
    });

  const out: Array<{ x: number; z: number }> = [];
  for (const r of g.roads) {
    if (!isVehicular(r.kind)) continue;
    let carry = spacing / 2;
    let side = 1;
    for (let i = 0; i + 3 < r.pts.length; i += 2) {
      const ax = r.pts[i]!;
      const az = r.pts[i + 1]!;
      const dx = r.pts[i + 2]! - ax;
      const dz = r.pts[i + 3]! - az;
      const len = Math.hypot(dx, dz);
      if (len < 0.01) continue;
      const nx = -dz / len;
      const nz = dx / len;
      const off = r.width / 2 + 0.8;
      for (let t = carry; t < len; t += spacing) {
        const x = ax + (dx / len) * t + nx * off * side;
        const z = az + (dz / len) * t + nz * off * side;
        side = -side;
        if (!onCarriageway(x, z)) out.push({ x, z });
      }
      carry = (carry - len) % spacing;
      if (carry < 0) carry += spacing;
    }
  }
  return out;
};
