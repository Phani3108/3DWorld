# OpenStreetMap extracts

Raw [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) extracts used to build real
streets and buildings for city districts.

| File | Area | Snapshot |
|---|---|---|
| `hyd-old-city.overpass.json` | 500 × 500 m around Charminar, Hyderabad | 2026-09-26 |

## Licence

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the
[Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

- These extracts **and** the compiled district files in `apps/web/public/geo/*.json` are derivative
  databases of OSM, so they are published here under ODbL 1.0 — not under the repository's MIT
  licence.
- The app credits OpenStreetMap in the footer of every district that uses this data.
- Generated "infill" buildings (`infill: true`) and estimated heights (`est: true`) are not OSM
  data; they fill blocks OSM hasn't mapped yet. Better: map them in OSM and recompile.

## Rebuild a district

```bash
node packages/content/scripts/osm-compile.ts hyd-old-city data/osm/hyd-old-city.overpass.json apps/web/public/geo/hyd-old-city.json 2-4
```

The last argument is the storey range used when OSM has no height (`2-4` suits old Hyderabad).

## Fetching a new extract

Bake extracts offline; never query Overpass at runtime (the public servers allow roughly
10k queries/day for one-off use). One bounding-box query per district:

```
[out:json][timeout:90][bbox:SOUTH,WEST,NORTH,EAST];(way;relation;node;);out body;
```
