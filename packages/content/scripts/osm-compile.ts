/**
 * Compile a district's OpenStreetMap extract into web geometry.
 *
 *   node packages/content/scripts/osm-compile.ts <districtId> [--levels 2-4] [--half 700] [--apply]
 *
 * --apply writes each venue's street frontage back into its city file, so the
 * server stands residents at the real door the client draws.
 * Reads data/osm/<districtId>.overpass.json, writes apps/web/public/geo/<districtId>.json.
 * The output is an ODbL derivative database (see data/osm/README.md).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { localFrame } from "@3dworld/contracts";
import { loadWorld } from "../src/index.ts";
import { compileDistrict, type OsmExtract } from "../src/osm/compile.ts";

const args = process.argv.slice(2);
const districtId = args[0];
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!districtId) {
  console.error("usage: osm-compile.ts <districtId> [--levels 2-4] [--half 700]");
  process.exit(2);
}

const world = loadWorld();
const district = world.districts.get(districtId);
if (!district) throw new Error(`unknown district ${districtId}`);
const levels = (flag("levels") ?? "2-4").split("-").map(Number) as [number, number];
const half = Number(flag("half") ?? Math.min(district.radiusM, 800));
const input = `data/osm/${districtId}.overpass.json`;
const output = `apps/web/public/geo/${districtId}.json`;

const osm = JSON.parse(readFileSync(input, "utf8")) as OsmExtract;
const places = [...world.places.values()]
  .filter((p) => p.districtId === districtId)
  .map((p) => ({ id: p.id, kind: p.kind, location: p.location }));
const report = compileDistrict(osm, {
  districtId,
  origin: district.origin,
  spawn: district.spawn,
  half,
  levels,
  places,
  landmarks: { Charminar: "charminar" },
});

const g = report.geometry;
mkdirSync(dirname(output), { recursive: true });
const json = JSON.stringify(g);
writeFileSync(output, `${json}\n`);

const count = (kind: string) => g.areas.filter((a) => a.kind === kind).length;
console.log(
  `${districtId}: ${g.roads.length} street runs, ${g.buildings.length - report.infill} mapped buildings ` +
    `(${report.estimatedHeights} heights estimated) + ${report.infill} infill, ` +
    `areas water ${count("water")} / park ${count("park")} / beach ${count("beach")} / plaza ${count("plaza")}, ` +
    `${g.trees.length / 2} trees, venues [${g.venues.map((v) => v.placeId).join(", ")}] → ${output} (${(json.length / 1024).toFixed(0)} KB)`,
);
console.log(
  `  arrival: along the street toward the centre = ${report.suggestedHeadingDeg}°` +
    (district.spawnHeadingDeg !== undefined
      ? ` (configured ${district.spawnHeadingDeg}°)`
      : " (not configured)"),
);
if (report.spawnOffRoadM > 1) {
  const p = localFrame(district.origin).toLatLon(report.suggestedSpawn);
  console.warn(
    `  spawn is ${report.spawnOffRoadM.toFixed(1)} m off the street; nearest street point: ` +
      `{ lat: ${p.lat.toFixed(6)}, lon: ${p.lon.toFixed(6)} }`,
  );
}

if (args.includes("--apply") && g.venues.length > 0) {
  const frame = localFrame(district.origin);
  const file = `packages/content/src/cities/${district.cityId}.ts`;
  let src = readFileSync(file, "utf8");
  for (const v of g.venues) {
    const at = frame.toLatLon({ x: v.x, z: v.z });
    // Storefront +z faces the street; three.js yaw θ ↔ compass heading 180° − θ.
    const yawDeg = Math.round((((180 - (v.yaw * 180) / Math.PI) % 360) + 360) % 360);
    const entry = `frontage: { location: { lat: ${at.lat.toFixed(6)}, lon: ${at.lon.toFixed(6)} }, yawDeg: ${yawDeg} },`;
    const start = src.indexOf(`id: "${v.placeId}"`);
    if (start < 0) continue;
    const end = src.indexOf("radiusM:", start);
    const block = src
      .slice(start, end)
      .replace(/\n\s*frontage: \{[\s\S]*?yawDeg: -?[0-9.]+,?\s*\},/, "");
    const withFrontage = block.replace(/(placement: "[a-z]+",)/, `$1\n      ${entry}`);
    src = src.slice(0, start) + withFrontage + src.slice(end);
  }
  writeFileSync(file, src);
  execFileSync("npx", ["biome", "format", "--write", file], { stdio: "ignore" });
  console.log(`  applied ${g.venues.length} frontage(s) to ${file}`);
}
