/**
 * Fetch an OpenStreetMap extract for a district from the public Overpass API.
 *
 *   node packages/content/scripts/osm-fetch.ts <districtId> [halfSizeMetres]
 *
 * Writes data/osm/<districtId>.overpass.json. Only the features the compiler
 * uses are requested, and ways come back whole (no clipping at the box edge).
 * Bake offline; never call Overpass at runtime (see data/osm/README.md).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { metresPerDegree } from "@3dworld/contracts";
import { loadWorld } from "../src/index.ts";

const [districtId, halfArg] = process.argv.slice(2);
if (!districtId) {
  console.error("usage: osm-fetch.ts <districtId> [halfSizeMetres]");
  process.exit(2);
}
const district = loadWorld().districts.get(districtId);
if (!district) throw new Error(`unknown district ${districtId}`);

const half = Number(halfArg ?? Math.min(district.radiusM, 800));
const k = metresPerDegree(district.origin.lat);
const s = district.origin.lat - half / k.lat;
const n = district.origin.lat + half / k.lat;
const w = district.origin.lon - half / k.lon;
const e = district.origin.lon + half / k.lon;
const bbox = [s, w, n, e].map((v) => v.toFixed(6)).join(",");

const query = `[out:json][timeout:180][bbox:${bbox}];
(
  way[building];
  relation[building][type=multipolygon];
  way[highway];
  way[landuse~"^(grass|recreation_ground|village_green|forest|cemetery)$"];
  way[leisure~"^(park|garden|pitch|playground)$"];
  relation[leisure~"^(park|garden)$"][type=multipolygon];
  way[natural~"^(water|beach|sand|wood|scrub|coastline)$"];
  relation[natural~"^(water|beach)$"][type=multipolygon];
  way[waterway=riverbank];
  way[amenity~"^(parking|fountain)$"];
  way[place=square];
  way["area:highway"];
  node[natural=tree];
  node[amenity~"^(fountain|place_of_worship)$"];
);
out body;
>;
out skel qt;`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Public Overpass servers shed load with 429/504; back off and retry politely.
for (let attempt = 0; attempt < 4; attempt++) {
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "3DWorld-map-bake/0.1 (+https://github.com/Phani3108/3DWorld)",
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(200_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const json = JSON.parse(text) as { elements?: unknown[]; remark?: string };
      if (json.remark?.includes("runtime error")) throw new Error(json.remark);
      if (!Array.isArray(json.elements) || json.elements.length === 0)
        throw new Error("empty extract");
      mkdirSync("data/osm", { recursive: true });
      const out = `data/osm/${districtId}.overpass.json`;
      writeFileSync(out, text);
      console.log(
        `${districtId}: ${json.elements.length} elements, ${(text.length / 1e6).toFixed(2)} MB from ${new URL(endpoint).host} → ${out}`,
      );
      process.exit(0);
    } catch (err) {
      console.warn(
        `${districtId}: ${new URL(endpoint).host} failed (${err instanceof Error ? err.message : err})`,
      );
    }
  }
  const wait = 30_000 * 2 ** attempt;
  console.warn(`${districtId}: all servers busy; retrying in ${wait / 1000}s`);
  await sleep(wait);
}
process.exit(1);
