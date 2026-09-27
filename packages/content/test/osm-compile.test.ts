import { localFrame } from "@3dworld/contracts";
import { describe, expect, it } from "vitest";
import {
  compileDistrict,
  joinWays,
  type OsmExtract,
  pointInRing,
  seaPolygons,
} from "../src/osm/compile.ts";

const ORIGIN = { lat: 17.36158, lon: 78.47466 };
const frame = localFrame(ORIGIN);

/** Build an Overpass-style extract from local-metre coordinates. */
const extract = (spec: {
  nodes: Array<[id: number, x: number, z: number, tags?: Record<string, string>]>;
  ways: Array<[id: number, nodes: number[], tags: Record<string, string>]>;
  relations?: Array<[id: number, members: number[], tags: Record<string, string>]>;
}): OsmExtract => ({
  elements: [
    ...spec.nodes.map(([id, x, z, tags]) => ({
      type: "node" as const,
      id,
      ...frame.toLatLon({ x, z }),
      ...(tags ? { tags } : {}),
    })),
    ...spec.ways.map(([id, nodes, tags]) => ({ type: "way" as const, id, nodes, tags })),
    ...(spec.relations ?? []).map(([id, members, tags]) => ({
      type: "relation" as const,
      id,
      members: members.map((ref) => ({ type: "way", ref, role: "outer" })),
      tags,
    })),
  ],
});

const opts = (overrides: Partial<Parameters<typeof compileDistrict>[1]> = {}) => ({
  districtId: "test",
  origin: ORIGIN,
  spawn: frame.toLatLon({ x: 0, z: -2 }),
  half: 200,
  levels: [2, 4] as [number, number],
  places: [],
  ...overrides,
});

describe("joinWays", () => {
  it("joins open ways into a ring, reversing pieces as needed", () => {
    const { rings, open } = joinWays([
      [1, 2, 3],
      [5, 4, 3],
      [5, 6, 1],
    ]);
    expect(open).toEqual([]);
    expect(rings).toHaveLength(1);
    expect(new Set(rings[0])).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    expect(rings[0]![0]).toBe(rings[0]![rings[0]!.length - 1]);
  });
});

describe("seaPolygons", () => {
  const box = { minX: -100, minZ: -100, maxX: 100, maxZ: 100 };

  it("puts the sea on the right of a coastline (OSM convention)", () => {
    // Coast running north → south along x = 0: land to the east (left), sea to the west (right).
    const { polygons } = seaPolygons(
      [
        [
          { x: 0, z: -150 },
          { x: 0, z: 150 },
        ],
      ],
      box,
    );
    expect(polygons).toHaveLength(1);
    const ring = polygons[0]!.flatMap((p) => [p.x, p.z]);
    expect(pointInRing(-50, 0, ring)).toBe(true);
    expect(pointInRing(50, 0, ring)).toBe(false);
  });

  it("reverses the side when the coastline runs the other way", () => {
    const { polygons } = seaPolygons(
      [
        [
          { x: 0, z: 150 },
          { x: 0, z: -150 },
        ],
      ],
      box,
    );
    const ring = polygons[0]!.flatMap((p) => [p.x, p.z]);
    expect(pointInRing(50, 0, ring)).toBe(true);
    expect(pointInRing(-50, 0, ring)).toBe(false);
  });

  it("keeps islands fully inside the box as land", () => {
    const island = [
      { x: -10, z: -10 },
      { x: 10, z: -10 },
      { x: 10, z: 10 },
      { x: -10, z: 10 },
      { x: -10, z: -10 },
    ];
    const { polygons, islands } = seaPolygons([island], box);
    expect(polygons).toEqual([]);
    expect(islands).toHaveLength(1);
  });
});

describe("compileDistrict", () => {
  const street = extract({
    nodes: [
      [1, -150, 0],
      [2, 150, 0],
      // A mapped building north of the street.
      [10, -60, -30],
      [11, -40, -30],
      [12, -40, -12],
      [13, -60, -12],
    ],
    ways: [
      [100, [1, 2], { highway: "primary", name: "Test Road" }],
      [200, [10, 11, 12, 13, 10], { building: "yes", "building:levels": "3" }],
    ],
  });

  it("keeps streets and mapped buildings with heights from levels", () => {
    const { geometry } = compileDistrict(street, opts());
    expect(geometry.roads).toHaveLength(1);
    expect(geometry.roads[0]).toMatchObject({ kind: "primary", width: 14, name: "Test Road" });
    const mapped = geometry.buildings.filter((b) => !b.infill);
    expect(mapped).toHaveLength(1);
    expect(mapped[0]!.h).toBeCloseTo(3 * 3.2 + 0.6, 1);
    expect(mapped[0]!.est).toBeUndefined();
  });

  it("fills empty frontage with flagged infill that never overlaps the street or mapped buildings", () => {
    const { geometry, infill } = compileDistrict(street, opts());
    expect(infill).toBeGreaterThan(5);
    const mappedRing = geometry.buildings.find((b) => !b.infill)!.ring;
    for (const b of geometry.buildings.filter((x) => x.infill)) {
      expect(b.est).toBe(true);
      for (let i = 0; i < b.ring.length; i += 2) {
        // Outside the carriageway (half-width 7) and not inside the mapped building.
        expect(Math.abs(b.ring[i + 1]!)).toBeGreaterThan(7);
        expect(pointInRing(b.ring[i]!, b.ring[i + 1]!, mappedRing)).toBe(false);
      }
    }
  });

  it("puts a venue on the street frontage facing the street, and a spawn on the road", () => {
    const report = compileDistrict(
      street,
      opts({ places: [{ id: "cafe", kind: "cafe", location: frame.toLatLon({ x: 20, z: 25 }) }] }),
    );
    const v = report.geometry.venues.find((x) => x.placeId === "cafe")!;
    expect(v).toBeDefined();
    expect(v.z).toBeGreaterThan(7); // south of the street, like the place
    // Facing the street (north, -z): yaw maps the storefront's +z onto -z.
    expect(Math.abs(Math.abs(v.yaw) - Math.PI)).toBeLessThan(0.05);
    expect(report.spawnOffRoadM).toBe(0);
  });

  it("assembles multipolygon buildings and marks hand-built landmarks", () => {
    const osm = extract({
      nodes: [
        [1, -10, -10],
        [2, 10, -10],
        [3, 10, 10],
        [4, -10, 10],
      ],
      ways: [
        [100, [1, 2, 3], {}],
        [101, [3, 4, 1], {}],
      ],
      relations: [
        [
          500,
          [100, 101],
          { type: "multipolygon", building: "yes", name: "Charminar", height: "20" },
        ],
      ],
    });
    const { geometry } = compileDistrict(osm, opts({ landmarks: { Charminar: "charminar" } }));
    expect(geometry.buildings).toHaveLength(1);
    expect(geometry.buildings[0]).toMatchObject({
      id: 500,
      h: 20,
      landmark: "charminar",
      name: "Charminar",
    });
  });

  it("turns motorways and slip roads into drawable streets", () => {
    const osm = extract({
      nodes: [
        [1, -100, 0],
        [2, 100, 0],
        [3, -100, 30],
        [4, 100, 30],
      ],
      ways: [
        [100, [1, 2], { highway: "motorway" }],
        [101, [3, 4], { highway: "primary_link" }],
      ],
    });
    const { geometry } = compileDistrict(osm, opts());
    expect(geometry.roads.map((r) => [r.kind, r.width])).toEqual([
      ["trunk", 24],
      ["primary", 7],
    ]);
  });
});
