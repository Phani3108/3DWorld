import {
  type DistrictGeometry,
  type LatLon,
  type LocalPoint,
  localFrame,
  type RoadKind,
} from "@3dworld/contracts";

/**
 * OpenStreetMap (Overpass JSON) → compact district geometry for the web client.
 * Output is a Derivative Database of OSM (ODbL 1.0): keep the attribution and
 * publish it under ODbL (see data/osm/README.md).
 */

type Tags = Record<string, string>;
export type OsmNode = { type: "node"; id: number; lat: number; lon: number; tags?: Tags };
export type OsmWay = { type: "way"; id: number; nodes: number[]; tags?: Tags };
export type OsmRelation = {
  type: "relation";
  id: number;
  members: Array<{ type: string; ref: number; role: string }>;
  tags?: Tags;
};
export type OsmExtract = {
  elements: Array<OsmNode | OsmWay | OsmRelation>;
  osm3s?: { timestamp_osm_base?: string };
};

export type CompileOptions = {
  districtId: string;
  origin: LatLon;
  spawn: LatLon;
  /** Half the side of the square to keep, metres from the origin. */
  half: number;
  /** Storey range for buildings OSM gives no height for. */
  levels: [number, number];
  /** Places in this district: venues get a street-front lot, landmarks a clear zone. */
  places: Array<{ id: string; kind: string; location: LatLon }>;
  /** OSM names → hand-built model keys (e.g. "Charminar" → "charminar"). */
  landmarks?: Record<string, string>;
};

export type CompileReport = {
  /** Along the arrival street, toward the district origin; degrees clockwise from north. */
  suggestedHeadingDeg: number;
  geometry: DistrictGeometry;
  estimatedHeights: number;
  infill: number;
  spawnOffRoadM: number;
  /** Nearest point on a vehicular street to the configured spawn (local metres). */
  suggestedSpawn: LocalPoint;
};

const FLOOR = 3.2;
const r1 = (v: number) => Math.round(v * 10) / 10;

export const ROAD_WIDTH: Record<RoadKind, number> = {
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

/** Integer hash → [0, 1). */
export const hash01 = (n: number) => {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const pointInRing = (x: number, z: number, flat: number[]) => {
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

/** Join way node-lists into closed rings (for multipolygons and coastlines). */
export const joinWays = (lists: number[][]) => {
  const pending = lists.filter((l) => l.length >= 2).map((l) => [...l]);
  const rings: number[][] = [];
  const open: number[][] = [];
  while (pending.length) {
    let cur = pending.shift()!;
    let grew = true;
    while (cur[0] !== cur[cur.length - 1] && grew) {
      grew = false;
      for (let i = 0; i < pending.length; i++) {
        const p = pending[i]!;
        const end = cur[cur.length - 1];
        const start = cur[0];
        if (p[0] === end) cur = cur.concat(p.slice(1));
        else if (p[p.length - 1] === end) cur = cur.concat([...p].reverse().slice(1));
        else if (p[p.length - 1] === start) cur = p.concat(cur.slice(1));
        else if (p[0] === start) cur = [...p].reverse().concat(cur.slice(1));
        else continue;
        pending.splice(i, 1);
        grew = true;
        break;
      }
    }
    (cur[0] === cur[cur.length - 1] ? rings : open).push(cur);
  }
  return { rings, open };
};

/** Join coastline ways in their own direction only (direction carries land/water sides). */
const chainDirected = (lists: number[][]) => {
  const chains = lists.map((l) => [...l]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < chains.length; i++) {
      for (let j = 0; j < chains.length; j++) {
        if (i === j) continue;
        const a = chains[i]!;
        const b = chains[j]!;
        if (a[a.length - 1] === b[0] && a[0] !== a[a.length - 1]) {
          chains[i] = a.concat(b.slice(1));
          chains.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  return chains;
};

type Box = { minX: number; minZ: number; maxX: number; maxZ: number };

/**
 * Sea polygons inside `box` from coastline chains. OSM draws coastlines with
 * land on the left and water on the right, so walking a water polygon
 * clockwise (north-up) follows the coast and then the box edge.
 */
export const seaPolygons = (chains: LocalPoint[][], box: Box) => {
  const W = box.maxX - box.minX;
  const H = box.maxZ - box.minZ;
  const P = 2 * (W + H);
  const eps = 1e-6;
  const tOf = (p: LocalPoint) => {
    if (Math.abs(p.z - box.minZ) < eps) return p.x - box.minX;
    if (Math.abs(p.x - box.maxX) < eps) return W + (p.z - box.minZ);
    if (Math.abs(p.z - box.maxZ) < eps) return W + H + (box.maxX - p.x);
    return 2 * W + H + (box.maxZ - p.z);
  };
  const corners: Array<[number, LocalPoint]> = [
    [0, { x: box.minX, z: box.minZ }],
    [W, { x: box.maxX, z: box.minZ }],
    [W + H, { x: box.maxX, z: box.maxZ }],
    [2 * W + H, { x: box.minX, z: box.maxZ }],
  ];
  const inside = (p: LocalPoint) =>
    p.x >= box.minX && p.x <= box.maxX && p.z >= box.minZ && p.z <= box.maxZ;
  /** Where segment a→b crosses the box boundary (Liang–Barsky, first crossing from `a`). */
  const cross = (a: LocalPoint, b: LocalPoint, entering: boolean): LocalPoint => {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    let t0 = 0;
    let t1 = 1;
    const clip = (p: number, q: number) => {
      if (Math.abs(p) < 1e-12) return q >= 0;
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
      return true;
    };
    clip(-dx, a.x - box.minX);
    clip(dx, box.maxX - a.x);
    clip(-dz, a.z - box.minZ);
    clip(dz, box.maxZ - a.z);
    const t = entering ? t0 : t1;
    const p = { x: a.x + dx * t, z: a.z + dz * t };
    // Snap exactly onto the nearest edge so tOf() classifies it.
    const d = [
      Math.abs(p.z - box.minZ),
      Math.abs(p.x - box.maxX),
      Math.abs(p.z - box.maxZ),
      Math.abs(p.x - box.minX),
    ];
    const k = d.indexOf(Math.min(...d));
    if (k === 0) p.z = box.minZ;
    else if (k === 1) p.x = box.maxX;
    else if (k === 2) p.z = box.maxZ;
    else p.x = box.minX;
    return p;
  };

  type Piece = { pts: LocalPoint[]; tIn: number; tOut: number };
  const pieces: Piece[] = [];
  const islands: LocalPoint[][] = [];
  for (const chain of chains) {
    const closed =
      chain.length > 3 &&
      chain[0]!.x === chain[chain.length - 1]!.x &&
      chain[0]!.z === chain[chain.length - 1]!.z;
    if (closed && chain.every(inside)) {
      islands.push(chain.slice(0, -1));
      continue;
    }
    let cur: LocalPoint[] | null = null;
    for (let i = 0; i + 1 < chain.length; i++) {
      const a = chain[i]!;
      const b = chain[i + 1]!;
      const ai = inside(a);
      const bi = inside(b);
      if (ai && bi) {
        if (cur) cur.push(b);
      } else if (!ai && bi) {
        const e = cross(a, b, true);
        cur = [e, b];
      } else if (ai && !bi) {
        if (cur) {
          const x = cross(a, b, false);
          cur.push(x);
          pieces.push({ pts: cur, tIn: tOf(cur[0]!), tOut: tOf(x) });
          cur = null;
        }
      } else {
        // Both outside: the segment may still pass through the box.
        const e = cross(a, b, true);
        const x = cross(a, b, false);
        if (
          inside({ x: (e.x + x.x) / 2, z: (e.z + x.z) / 2 }) &&
          Math.hypot(x.x - e.x, x.z - e.z) > 0.5
        ) {
          pieces.push({ pts: [e, x], tIn: tOf(e), tOut: tOf(x) });
        }
      }
    }
  }

  const polygons: LocalPoint[][] = [];
  const used = new Set<Piece>();
  const clockwiseGap = (from: number, to: number) => (((to - from) % P) + P) % P;
  for (const start of pieces) {
    if (used.has(start)) continue;
    const ring: LocalPoint[] = [];
    let piece: Piece = start;
    for (let guard = 0; guard < pieces.length + 1; guard++) {
      used.add(piece);
      ring.push(...piece.pts);
      const t = piece.tOut;
      let next: Piece | null = null;
      let best = Number.POSITIVE_INFINITY;
      for (const p of pieces) {
        if (used.has(p) && p !== start) continue;
        const gap = clockwiseGap(t, p.tIn);
        if (gap < best) {
          best = gap;
          next = p;
        }
      }
      if (!next) break;
      // Walk the box edge clockwise to the next landfall, turning its corners.
      const turned = corners
        .map(([ct, c]) => ({ gap: clockwiseGap(t, ct), c }))
        .filter(({ gap }) => gap > eps && gap < best)
        .sort((a, b) => a.gap - b.gap);
      for (const { c } of turned) ring.push(c);
      if (next === start) break;
      piece = next;
    }
    if (ring.length >= 3) polygons.push(ring);
  }
  return { polygons, islands };
};

const flat = (pts: LocalPoint[]) => pts.flatMap((p) => [r1(p.x), r1(p.z)]);

export const compileDistrict = (osm: OsmExtract, opts: CompileOptions): CompileReport => {
  const frame = localFrame(opts.origin);
  const box: Box = { minX: -opts.half, minZ: -opts.half, maxX: opts.half, maxZ: opts.half };
  const margin = 20;
  const inBox = (p: LocalPoint, m = 0) =>
    p.x >= box.minX - m && p.x <= box.maxX + m && p.z >= box.minZ - m && p.z <= box.maxZ + m;

  const nodes = new Map<number, OsmNode>();
  const ways = new Map<number, OsmWay>();
  const relations: OsmRelation[] = [];
  for (const e of osm.elements) {
    if (e.type === "node") nodes.set(e.id, e);
    else if (e.type === "way") {
      const prior = ways.get(e.id);
      // Keep the tagged copy when a way appears twice (tagged + skeleton recursion).
      if (!prior || (!prior.tags && e.tags)) ways.set(e.id, e);
    } else relations.push(e);
  }
  const at = (id: number): LocalPoint | null => {
    const n = nodes.get(id);
    return n ? frame.toLocal(n) : null;
  };
  const ringOf = (ids: number[]) => {
    if (ids.length < 4 || ids[0] !== ids[ids.length - 1]) return null;
    const pts: LocalPoint[] = [];
    for (const id of ids.slice(0, -1)) {
      const p = at(id);
      if (!p) return null;
      pts.push(p);
    }
    return pts;
  };
  const centroid = (pts: LocalPoint[]) => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    z: pts.reduce((s, p) => s + p.z, 0) / pts.length,
  });

  const geometry: DistrictGeometry = {
    version: 1,
    districtId: opts.districtId,
    origin: opts.origin,
    bounds: box,
    attribution: "© OpenStreetMap contributors",
    source: {
      license: "ODbL-1.0",
      snapshot: osm.osm3s?.timestamp_osm_base ?? "unknown",
      url: "https://www.openstreetmap.org/copyright",
    },
    roads: [],
    areas: [],
    buildings: [],
    trees: [],
    pois: [],
    venues: [],
  };

  // ── Buildings (ways + multipolygon relations) ─────────────────────
  let estimatedHeights = 0;
  const [minLevels, maxLevels] = opts.levels;
  const addBuilding = (id: number, pts: LocalPoint[], t: Tags) => {
    if (pts.length < 3 || !inBox(centroid(pts))) return;
    const height = Number.parseFloat(t.height ?? "");
    const levels = Number.parseFloat(t["building:levels"] ?? "");
    let h = Number.isFinite(height)
      ? height
      : Number.isFinite(levels)
        ? levels * FLOOR + 0.6
        : Number.NaN;
    const est = !Number.isFinite(h);
    if (est) {
      estimatedHeights++;
      h = (minLevels + Math.floor(hash01(id) * (maxLevels - minLevels + 1))) * FLOOR + 0.6;
    }
    const minHeight = Number.parseFloat(t.min_height ?? "");
    const gate = t.historic === "city_gate" || t.building === "gate";
    const roof = t.building === "roof";
    const name = t["name:en"] ?? t.name;
    const landmark = t.name ? opts.landmarks?.[t.name] : undefined;
    geometry.buildings.push({
      id,
      ring: flat(pts),
      h: r1(h),
      ...(gate
        ? { minH: r1(Math.min(h - 3, 7)) }
        : roof
          ? { minH: r1(Math.max(0, h - 0.6)) }
          : Number.isFinite(minHeight) && minHeight > 0
            ? { minH: r1(minHeight) }
            : {}),
      ...(est ? { est: true } : {}),
      ...(name ? { name } : {}),
      ...(landmark ? { landmark } : {}),
    });
  };

  const areaKind = (t: Tags): DistrictGeometry["areas"][number]["kind"] | null => {
    if (t.highway === "pedestrian" || t.place === "square" || t["area:highway"] === "pedestrian")
      return "plaza";
    if (t.leisure === "park" || t.leisure === "garden" || t.leisure === "playground") return "park";
    if (t.landuse === "grass" || t.landuse === "recreation_ground" || t.landuse === "village_green")
      return "park";
    if (
      t.natural === "wood" ||
      t.natural === "scrub" ||
      t.landuse === "forest" ||
      t.landuse === "cemetery"
    )
      return "park";
    if (t.leisure === "pitch") return "park";
    if (t.natural === "water" || t.water || t.waterway === "riverbank") return "water";
    if (t.natural === "beach" || t.natural === "sand") return "beach";
    if (t.amenity === "parking") return "parking";
    return null;
  };
  const addArea = (kind: DistrictGeometry["areas"][number]["kind"], pts: LocalPoint[]) => {
    if (pts.length < 3) return;
    if (!pts.some((p) => inBox(p, margin)) && !pointInRing(0, 0, flat(pts))) return;
    geometry.areas.push({ kind, ring: flat(pts) });
  };

  const coastlines: number[][] = [];
  for (const w of ways.values()) {
    const t = w.tags;
    if (!t) continue;
    if (t.natural === "coastline") {
      coastlines.push(w.nodes);
      continue;
    }
    if (t.building) {
      const pts = ringOf(w.nodes);
      if (pts) addBuilding(w.id, pts, t);
      continue;
    }
    const closed = w.nodes[0] === w.nodes[w.nodes.length - 1];
    // Motorways render as wide trunks; slip roads as narrow versions of their parent.
    const link = /^(motorway|trunk|primary|secondary|tertiary)_link$/.exec(t.highway ?? "");
    const tt: Tags =
      t.highway === "motorway" || link
        ? {
            ...t,
            highway: t.highway === "motorway" || link?.[1] === "motorway" ? "trunk" : link![1]!,
            width: t.width ?? (link ? "7" : "24"),
          }
        : t;
    if (isRoadKind(tt.highway) && !(closed && tt.area === "yes")) {
      const lanes = Number.parseFloat(tt.lanes ?? "");
      const tagged = Number.parseFloat(tt.width ?? "");
      const width = Number.isFinite(tagged)
        ? tagged
        : Number.isFinite(lanes)
          ? Math.max(ROAD_WIDTH[tt.highway], lanes * 3.2)
          : ROAD_WIDTH[tt.highway];
      // Keep runs of points within the box (plus a margin so streets run off the edge).
      let run: number[] = [];
      const flush = () => {
        if (run.length >= 4) {
          geometry.roads.push({
            kind: tt.highway as RoadKind,
            width: r1(width),
            pts: run,
            ...(tt.name ? { name: tt["name:en"] ?? tt.name } : {}),
          });
        }
        run = [];
      };
      for (const id of w.nodes) {
        const p = at(id);
        if (p && inBox(p, margin)) run.push(r1(p.x), r1(p.z));
        else flush();
      }
      flush();
      continue;
    }
    if (closed) {
      const kind = areaKind(t);
      const pts = kind ? ringOf(w.nodes) : null;
      if (kind && pts) addArea(kind, pts);
    }
  }

  for (const rel of relations) {
    const t = rel.tags ?? {};
    const outers = rel.members
      .filter((m) => m.type === "way" && (m.role === "outer" || m.role === ""))
      .map((m) => ways.get(m.ref)?.nodes)
      .filter((n): n is number[] => !!n);
    const { rings } = joinWays(outers);
    for (const ids of rings) {
      const pts = ringOf(ids);
      if (!pts) continue;
      if (t.building) addBuilding(rel.id, pts, t);
      else {
        const kind = areaKind(t);
        if (kind) addArea(kind, pts);
      }
    }
  }

  // ── Sea from coastlines ──────────────────────────────────────────
  if (coastlines.length) {
    const chains = chainDirected(coastlines)
      .map((ids) => ids.map(at).filter((p): p is LocalPoint => !!p))
      .filter((c) => c.length >= 2);
    const { polygons, islands } = seaPolygons(chains, box);
    for (const poly of polygons) geometry.areas.push({ kind: "water", ring: flat(poly) });
    for (const island of islands) geometry.areas.push({ kind: "land", ring: flat(island) });
  }

  // ── Trees and points of interest ─────────────────────────────────
  for (const n of nodes.values()) {
    const t = n.tags;
    if (!t) continue;
    const p = frame.toLocal(n);
    if (!inBox(p)) continue;
    if (t.natural === "tree") geometry.trees.push(r1(p.x), r1(p.z));
    const kind =
      t.amenity === "fountain" ? "fountain" : t.amenity === "place_of_worship" ? "worship" : null;
    if (kind)
      geometry.pois.push({
        kind,
        x: r1(p.x),
        z: r1(p.z),
        ...(t.name ? { name: t["name:en"] ?? t.name } : {}),
      });
  }

  // ── Street segments for placement checks ─────────────────────────
  type Seg = { ax: number; az: number; bx: number; bz: number; half: number; vehicular: boolean };
  const segs: Seg[] = [];
  for (const r of geometry.roads) {
    for (let i = 0; i + 3 < r.pts.length; i += 2) {
      segs.push({
        ax: r.pts[i]!,
        az: r.pts[i + 1]!,
        bx: r.pts[i + 2]!,
        bz: r.pts[i + 3]!,
        half: r.width / 2,
        vehicular: VEHICULAR.has(r.kind),
      });
    }
  }
  const nearest = (x: number, z: number, filter: (s: Seg) => boolean) => {
    let best: { d: number; s: Seg; px: number; pz: number } | null = null;
    for (const s of segs) {
      if (!filter(s)) continue;
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const len2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / len2));
      const px = s.ax + dx * t;
      const pz = s.az + dz * t;
      const d = Math.hypot(x - px, z - pz);
      if (!best || d < best.d) best = { d, s, px, pz };
    }
    return best;
  };
  const clearOfRoads = (x: number, z: number, m: number) =>
    segs.every((s) => {
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const len2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / len2));
      return Math.hypot(x - (s.ax + dx * t), z - (s.az + dz * t)) > s.half + m;
    });
  const water = geometry.areas.filter((a) => a.kind === "water").map((a) => a.ring);
  const onWater = (x: number, z: number) => water.some((r) => pointInRing(x, z, r));
  const open = geometry.areas
    .filter((a) => a.kind === "park" || a.kind === "plaza" || a.kind === "beach")
    .map((a) => a.ring);
  const onOpenSpace = (x: number, z: number) => open.some((r) => pointInRing(x, z, r));
  const mapped = geometry.buildings.map((b) => b.ring);
  const onBuilding = (x: number, z: number) => mapped.some((r) => pointInRing(x, z, r));
  // Grid of mapped-building vertices: infill only where the map is empty nearby.
  const CELL = 10;
  const vertexGrid = new Map<string, number>();
  for (const ring of mapped) {
    for (let i = 0; i < ring.length; i += 2) {
      const key = `${Math.floor(ring[i]! / CELL)},${Math.floor(ring[i + 1]! / CELL)}`;
      vertexGrid.set(key, (vertexGrid.get(key) ?? 0) + 1);
    }
  }
  const mappedNear = (x: number, z: number) => {
    const cx = Math.floor(x / CELL);
    const cz = Math.floor(z / CELL);
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++) if (vertexGrid.has(`${cx + i},${cz + j}`)) return true;
    return false;
  };

  // ── Venues on real street frontage; clear zones for landmarks ────
  const keepOut: Array<{ x: number; z: number; r: number }> = [];
  for (const b of geometry.buildings) {
    if (!b.landmark) continue;
    const pts: LocalPoint[] = [];
    for (let i = 0; i < b.ring.length; i += 2) pts.push({ x: b.ring[i]!, z: b.ring[i + 1]! });
    keepOut.push({ ...centroid(pts), r: 42 });
  }
  const STOREFRONT = { depth: 7, sidewalk: 2.2 };
  for (const p of opts.places) {
    const loc = frame.toLocal(p.location);
    if (p.kind === "landmark" || p.kind === "park" || p.kind === "promenade") {
      keepOut.push({ ...loc, r: p.kind === "landmark" ? 42 : 30 });
      continue;
    }
    const best = nearest(loc.x, loc.z, (s) => s.half >= 2.5);
    if (!best) continue;
    const { s } = best;
    const len = Math.hypot(s.bx - s.ax, s.bz - s.az) || 1;
    const ux = (s.bx - s.ax) / len;
    const uz = (s.bz - s.az) / len;
    let nx = -uz;
    let nz = ux;
    if ((loc.x - best.px) * nx + (loc.z - best.pz) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    const off = s.half + STOREFRONT.sidewalk + STOREFRONT.depth / 2;
    for (const slide of [0, 8, -8, 16, -16, 24, -24, 32, -32]) {
      for (const side of [1, -1]) {
        const cx = best.px + ux * slide + nx * off * side;
        const cz = best.pz + uz * slide + nz * off * side;
        if (
          onBuilding(cx, cz) ||
          onWater(cx, cz) ||
          !clearOfRoads(cx, cz, 0.5) ||
          !inBox({ x: cx, z: cz })
        )
          continue;
        geometry.venues.push({
          placeId: p.id,
          x: r1(cx),
          z: r1(cz),
          yaw: Math.round(Math.atan2(-nx * side, -nz * side) * 1000) / 1000,
        });
        keepOut.push({ x: cx, z: cz, r: 9 });
        break;
      }
      if (geometry.venues.some((v) => v.placeId === p.id)) break;
    }
  }

  // ── Arrival point on a real street ──────────────────────────────
  const spawn = frame.toLocal(opts.spawn);
  const street =
    nearest(spawn.x, spawn.z, (s) => s.vehicular || s.half >= 2.9) ??
    nearest(spawn.x, spawn.z, () => true);
  const spawnOffRoadM = street ? Math.max(0, street.d - street.s.half) : Number.POSITIVE_INFINITY;
  const suggestedSpawn = street ? { x: r1(street.px), z: r1(street.pz) } : spawn;
  let suggestedHeadingDeg = ((Math.atan2(-spawn.x, spawn.z) * 180) / Math.PI + 360) % 360;
  if (street) {
    let ux = street.s.bx - street.s.ax;
    let uz = street.s.bz - street.s.az;
    if (ux * -suggestedSpawn.x + uz * -suggestedSpawn.z < 0) {
      ux = -ux;
      uz = -uz;
    }
    suggestedHeadingDeg = Math.round(((Math.atan2(ux, -uz) * 180) / Math.PI + 360) % 360);
  }
  keepOut.push({ ...suggestedSpawn, r: 10 });

  // ── Street-front infill where OSM has no buildings ──────────────
  const placed: Array<{ x: number; z: number; r: number }> = [];
  const INFILL = new Set<RoadKind>([...VEHICULAR, "pedestrian"]);
  let infill = 0;
  for (const r of geometry.roads) {
    if (!INFILL.has(r.kind)) continue;
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
        let t = 3 + hash01(i * 31 + side + r.pts.length) * 4;
        while (t < len - 3) {
          const seed = Math.floor(ax * 13 + az * 7 + t * 3 + side);
          const front = 8 + hash01(seed) * 8;
          const depth = 10 + hash01(seed + 1) * 7;
          const setback = r.width / 2 + 2.2;
          const cx = ax + ux * (t + front / 2) + nx * (setback + depth / 2);
          const cz = az + uz * (t + front / 2) + nz * (setback + depth / 2);
          t += front + 0.4;
          const hw = front / 2 - 0.2;
          const hd = depth / 2;
          const corners: LocalPoint[] = [
            { x: cx - ux * hw - nx * hd, z: cz - uz * hw - nz * hd },
            { x: cx + ux * hw - nx * hd, z: cz + uz * hw - nz * hd },
            { x: cx + ux * hw + nx * hd, z: cz + uz * hw + nz * hd },
            { x: cx - ux * hw + nx * hd, z: cz - uz * hw + nz * hd },
          ];
          const probe = [{ x: cx, z: cz }, ...corners];
          if (!probe.every((p) => inBox(p, -5) && clearOfRoads(p.x, p.z, 1.2))) continue;
          if (mappedNear(cx, cz)) continue; // OSM has buildings here already
          if (probe.some((p) => onBuilding(p.x, p.z) || onWater(p.x, p.z) || onOpenSpace(p.x, p.z)))
            continue;
          if (keepOut.some((k) => Math.hypot(cx - k.x, cz - k.z) < k.r)) continue;
          const rr = Math.min(front, depth) / 2;
          if (placed.some((p) => Math.hypot(cx - p.x, cz - p.z) < p.r + rr)) continue;
          placed.push({ x: cx, z: cz, r: rr });
          const levels = minLevels + Math.floor(hash01(seed + 2) * (maxLevels - minLevels + 1));
          geometry.buildings.push({
            id: -++infill,
            ring: flat(corners),
            h: r1(levels * FLOOR + 0.6),
            est: true,
            infill: true,
          });
        }
      }
    }
  }

  return { geometry, estimatedHeights, infill, spawnOffRoadM, suggestedSpawn, suggestedHeadingDeg };
};
