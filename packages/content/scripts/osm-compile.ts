/**
 * Compile an Overpass JSON extract into district geometry for the web client.
 *
 *   node packages/content/scripts/osm-compile.ts <districtId> <overpass.json> <out.json> [minLevels-maxLevels]
 *
 * Output is a Derivative Database of OpenStreetMap (ODbL 1.0): keep the
 * attribution and publish it under ODbL (see data/osm/README.md).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { type DistrictGeometry, localFrame, type RoadKind } from "@3dworld/contracts";
import { loadWorld } from "../src/index.ts";

type OsmNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};
type OsmWay = { type: "way"; id: number; nodes: number[]; tags?: Record<string, string> };
type OsmElement =
  | OsmNode
  | OsmWay
  | { type: "relation"; id: number; tags?: Record<string, string> };

const [districtId, input, output, levelsArg = "2-4"] = process.argv.slice(2);
if (!districtId || !input || !output) {
  console.error(
    "usage: osm-compile.ts <districtId> <overpass.json> <out.json> [minLevels-maxLevels]",
  );
  process.exit(2);
}

const world = loadWorld();
const district = world.districts.get(districtId);
if (!district) throw new Error(`unknown district ${districtId}`);
const frame = localFrame(district.origin);
const [minLevels, maxLevels] = levelsArg.split("-").map(Number) as [number, number];
const FLOOR = 3.2;

const raw = JSON.parse(readFileSync(input, "utf8")) as {
  elements: OsmElement[];
  osm3s?: { timestamp_osm_base?: string };
};
const nodes = new Map<number, OsmNode>();
for (const e of raw.elements) if (e.type === "node") nodes.set(e.id, e);
const ways = raw.elements.filter((e): e is OsmWay => e.type === "way");

const r1 = (v: number) => Math.round(v * 10) / 10;
const point = (id: number) => {
  const n = nodes.get(id);
  if (!n) return null;
  const p = frame.toLocal(n);
  return [r1(p.x), r1(p.z)] as const;
};
/** Consecutive runs of nodes present in the extract (ways crossing the bbox edge are cut). */
const runs = (ids: number[]) => {
  const out: number[][] = [];
  let cur: number[] = [];
  for (const id of ids) {
    const p = point(id);
    if (p) cur.push(p[0], p[1]);
    else if (cur.length) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out.filter((r) => r.length >= 4);
};
/** Closed ring with every node present (last point dropped), or null. */
const ring = (ids: number[]) => {
  if (ids.length < 4 || ids[0] !== ids[ids.length - 1]) return null;
  const flat: number[] = [];
  for (const id of ids.slice(0, -1)) {
    const p = point(id);
    if (!p) return null;
    flat.push(p[0], p[1]);
  }
  return flat;
};

const ROAD_WIDTH: Record<RoadKind, number> = {
  trunk: 16,
  primary: 14,
  secondary: 12,
  tertiary: 10,
  residential: 7,
  living_street: 6,
  service: 5,
  unclassified: 7,
  pedestrian: 6,
  footway: 2.5,
  path: 2,
  steps: 2.5,
};
const isRoadKind = (k: string | undefined): k is RoadKind => !!k && k in ROAD_WIDTH;

// Hand-built models replace these footprints.
const LANDMARKS: Record<string, string> = { Charminar: "charminar" };

const hash = (n: number) => {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const geometry: DistrictGeometry = {
  version: 1,
  districtId,
  origin: district.origin,
  bounds: { minX: 0, minZ: 0, maxX: 0, maxZ: 0 },
  attribution: "© OpenStreetMap contributors",
  source: {
    license: "ODbL-1.0",
    snapshot: raw.osm3s?.timestamp_osm_base ?? "unknown",
    url: "https://www.openstreetmap.org/copyright",
  },
  roads: [],
  areas: [],
  buildings: [],
  trees: [],
  pois: [],
  venues: [],
};

let estimated = 0;
for (const w of ways) {
  const t = w.tags ?? {};
  const closed = w.nodes[0] === w.nodes[w.nodes.length - 1];

  if (t.building || t["building:part"]) {
    if (t["building:part"] && !t.building) continue; // parts duplicate their outline
    const r = ring(w.nodes);
    if (!r) continue;
    const height = Number.parseFloat(t.height ?? "");
    const levels = Number.parseFloat(t["building:levels"] ?? "");
    let h = Number.isFinite(height)
      ? height
      : Number.isFinite(levels)
        ? levels * FLOOR + 0.6
        : Number.NaN;
    const est = !Number.isFinite(h);
    if (est) {
      estimated++;
      h = (minLevels + Math.floor(hash(w.id) * (maxLevels - minLevels + 1))) * FLOOR + 0.6;
    }
    const gate = t.historic === "city_gate" || t.building === "gate";
    const roof = t.building === "roof";
    const landmark = t.name ? LANDMARKS[t.name] : undefined;
    geometry.buildings.push({
      id: w.id,
      ring: r,
      h: r1(h),
      ...(gate ? { minH: r1(Math.min(h - 3, 7)) } : roof ? { minH: r1(Math.max(0, h - 0.6)) } : {}),
      ...(est ? { est: true } : {}),
      ...(t.name ? { name: t["name:en"] ?? t.name } : {}),
      ...(landmark ? { landmark } : {}),
    });
    continue;
  }

  if (isRoadKind(t.highway) && !(closed && t.area === "yes")) {
    const lanes = Number.parseFloat(t.lanes ?? "");
    const tagged = Number.parseFloat(t.width ?? "");
    const width = Number.isFinite(tagged)
      ? tagged
      : Number.isFinite(lanes)
        ? Math.max(ROAD_WIDTH[t.highway], lanes * 3.2)
        : ROAD_WIDTH[t.highway];
    for (const pts of runs(w.nodes)) {
      geometry.roads.push({
        kind: t.highway,
        width: r1(width),
        pts,
        ...(t.name ? { name: t["name:en"] ?? t.name } : {}),
      });
    }
    continue;
  }

  if (closed) {
    const kind =
      t.highway === "pedestrian" || t.place === "square" || t["area:highway"] === "pedestrian"
        ? "plaza"
        : t.leisure === "park" ||
            t.leisure === "garden" ||
            t.landuse === "grass" ||
            t.landuse === "recreation_ground"
          ? "park"
          : t.natural === "water" || t.water || t.waterway === "riverbank"
            ? "water"
            : t.amenity === "parking"
              ? "parking"
              : null;
    const r = kind ? ring(w.nodes) : null;
    if (kind && r) geometry.areas.push({ kind, ring: r });
  }
}

for (const n of nodes.values()) {
  const t = n.tags;
  if (!t) continue;
  const p = frame.toLocal(n);
  if (t.natural === "tree") geometry.trees.push(r1(p.x), r1(p.z));
  const kind =
    t.amenity === "fountain"
      ? "fountain"
      : t.amenity === "place_of_worship"
        ? "worship"
        : t.shop
          ? "shop"
          : null;
  if (kind)
    geometry.pois.push({
      kind,
      x: r1(p.x),
      z: r1(p.z),
      ...(t.name ? { name: t["name:en"] ?? t.name } : {}),
    });
}

// Extent of the mapped data (the Overpass bbox, in practice).
const xs: number[] = [];
const zs: number[] = [];
const collect = (flat: number[]) => {
  for (let i = 0; i < flat.length; i += 2) {
    xs.push(flat[i]!);
    zs.push(flat[i + 1]!);
  }
};
for (const r of geometry.roads) collect(r.pts);
for (const b of geometry.buildings) collect(b.ring);
geometry.bounds = {
  minX: Math.min(...xs),
  minZ: Math.min(...zs),
  maxX: Math.max(...xs),
  maxZ: Math.max(...zs),
};

// ── Street-front infill ──────────────────────────────────────────────
// OSM maps only some buildings in dense old cities. Line every vehicular and
// pedestrian street with generated lots wherever the map is empty, so streets
// read as streets. Marked `infill` so the client (and credits) can tell.
type Seg = { ax: number; az: number; bx: number; bz: number; half: number };
const segs: Seg[] = [];
for (const r of geometry.roads) {
  for (let i = 0; i + 3 < r.pts.length; i += 2) {
    segs.push({
      ax: r.pts[i]!,
      az: r.pts[i + 1]!,
      bx: r.pts[i + 2]!,
      bz: r.pts[i + 3]!,
      half: r.width / 2,
    });
  }
}
const distToSeg = (x: number, z: number, s: Seg) => {
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  const len2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / len2));
  return Math.hypot(x - (s.ax + dx * t), z - (s.az + dz * t));
};
const clearOfRoads = (x: number, z: number, margin: number) =>
  segs.every((s) => distToSeg(x, z, s) > s.half + margin);
const inside = (x: number, z: number, flat: number[]) => {
  let hit = false;
  for (let i = 0, j = flat.length - 2; i < flat.length; j = i, i += 2) {
    const xi = flat[i]!;
    const zi = flat[i + 1]!;
    const xj = flat[j]!;
    const zj = flat[j + 1]!;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
};
const mapped = geometry.buildings.map((b) => b.ring);
const keepOut = geometry.buildings
  .filter((b) => b.landmark)
  .map((b) => {
    let cx = 0;
    let cz = 0;
    for (let i = 0; i < b.ring.length; i += 2) {
      cx += b.ring[i]!;
      cz += b.ring[i + 1]!;
    }
    return { x: (cx / b.ring.length) * 2, z: (cz / b.ring.length) * 2, r: 42 };
  });
// Venues get a street-front lot on the nearest real street (sliding along it
// if a mapped building is in the way); landmarks and parks keep a clear zone.
const STOREFRONT = { depth: 7, sidewalk: 2.2 };
const frontSegs = segs.filter((s) => s.half >= 2.5);
for (const p of world.places.values()) {
  if (p.districtId !== districtId) continue;
  const at = frame.toLocal(p.location);
  if (p.kind === "landmark" || p.kind === "park" || p.kind === "promenade") {
    keepOut.push({ x: at.x, z: at.z, r: p.kind === "landmark" ? 42 : 30 });
    continue;
  }
  let best: { d: number; s: Seg; t: number } | null = null;
  for (const s of frontSegs) {
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((at.x - s.ax) * dx + (at.z - s.az) * dz) / len2));
    const d = Math.hypot(at.x - (s.ax + dx * t), at.z - (s.az + dz * t));
    if (!best || d < best.d) best = { d, s, t };
  }
  if (!best) continue;
  const { s } = best;
  const len = Math.hypot(s.bx - s.ax, s.bz - s.az) || 1;
  const ux = (s.bx - s.ax) / len;
  const uz = (s.bz - s.az) / len;
  // Normal pointing to the side of the street the place is on.
  const px = s.ax + (s.bx - s.ax) * best.t;
  const pz = s.az + (s.bz - s.az) * best.t;
  let nx = -uz;
  let nz = ux;
  if ((at.x - px) * nx + (at.z - pz) * nz < 0) {
    nx = -nx;
    nz = -nz;
  }
  const off = s.half + STOREFRONT.sidewalk + STOREFRONT.depth / 2;
  for (const slide of [0, 8, -8, 16, -16, 24, -24]) {
    const cx = px + ux * slide + nx * off;
    const cz = pz + uz * slide + nz * off;
    if (mapped.some((m) => inside(cx, cz, m))) continue;
    if (!clearOfRoads(cx, cz, 0.5)) continue;
    geometry.venues.push({
      placeId: p.id,
      x: r1(cx),
      z: r1(cz),
      yaw: Math.round(Math.atan2(-nx, -nz) * 1000) / 1000,
    });
    keepOut.push({ x: cx, z: cz, r: 9 });
    break;
  }
}
const spawn = frame.toLocal(district.spawn);
keepOut.push({ x: spawn.x, z: spawn.z, r: 10 });
const nearestRoad = Math.min(...segs.map((s) => distToSeg(spawn.x, spawn.z, s) - s.half));
if (nearestRoad > 1)
  console.warn(`warn: spawn is ${nearestRoad.toFixed(1)} m off the nearest road surface`);
const placed: Array<{ x: number; z: number; r: number }> = [];
const within = (x: number, z: number) =>
  x > geometry.bounds.minX + 5 &&
  x < geometry.bounds.maxX - 5 &&
  z > geometry.bounds.minZ + 5 &&
  z < geometry.bounds.maxZ - 5;

let infill = 0;
const INFILL_ROADS = new Set<RoadKind>([
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "residential",
  "living_street",
  "unclassified",
  "pedestrian",
  "service",
]);
for (const r of geometry.roads) {
  if (!INFILL_ROADS.has(r.kind)) continue;
  for (let i = 0; i + 3 < r.pts.length; i += 2) {
    const ax = r.pts[i]!;
    const az = r.pts[i + 1]!;
    const dx = r.pts[i + 2]! - ax;
    const dz = r.pts[i + 3]! - az;
    const len = Math.hypot(dx, dz);
    if (len < 8) continue;
    const ux = dx / len;
    const uz = dz / len;
    for (const side of [-1, 1]) {
      const nx = -uz * side;
      const nz = ux * side;
      let t = 3 + hash(i * 31 + side + r.pts.length) * 4;
      while (t < len - 3) {
        const seed = Math.floor(ax * 13 + az * 7 + t * 3 + side);
        const front = 6 + hash(seed) * 7;
        const depth = 10 + hash(seed + 1) * 7;
        const setback = r.width / 2 + 2.2;
        const cx = ax + ux * (t + front / 2) + nx * (setback + depth / 2);
        const cz = az + uz * (t + front / 2) + nz * (setback + depth / 2);
        t += front + 0.4;
        const hw = front / 2 - 0.2;
        const hd = depth / 2;
        const corners = [
          [cx - ux * hw - nx * hd, cz - uz * hw - nz * hd],
          [cx + ux * hw - nx * hd, cz + uz * hw - nz * hd],
          [cx + ux * hw + nx * hd, cz + uz * hw + nz * hd],
          [cx - ux * hw + nx * hd, cz - uz * hw + nz * hd],
        ] as const;
        const probe = [[cx, cz] as const, ...corners];
        if (!probe.every(([x, z]) => within(x, z) && clearOfRoads(x, z, 1.2))) continue;
        if (probe.some(([x, z]) => mapped.some((m) => inside(x, z, m)))) continue;
        if (keepOut.some((k) => Math.hypot(cx - k.x, cz - k.z) < k.r)) continue;
        const rr = Math.min(front, depth) / 2;
        if (placed.some((p) => Math.hypot(cx - p.x, cz - p.z) < p.r + rr)) continue;
        placed.push({ x: cx, z: cz, r: rr });
        const levels = minLevels + Math.floor(hash(seed + 2) * (maxLevels - minLevels + 1));
        geometry.buildings.push({
          id: -++infill,
          ring: corners.flatMap(([x, z]) => [r1(x), r1(z)]),
          h: r1(levels * FLOOR + 0.6),
          est: true,
          infill: true,
        });
      }
    }
  }
}
console.log(
  `infill: ${infill} generated street-front lots; venues: ${geometry.venues.map((v) => v.placeId).join(", ")}`,
);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(geometry)}\n`);
const kb = (JSON.stringify(geometry).length / 1024).toFixed(1);
console.log(
  `${districtId}: ${geometry.roads.length} road runs, ${geometry.buildings.length} buildings (${estimated} heights estimated), ` +
    `${geometry.areas.length} areas, ${geometry.trees.length / 2} trees, ${geometry.pois.length} pois → ${output} (${kb} KB)`,
);
