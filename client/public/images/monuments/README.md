# 📸 Monument photo layer (Phase 10E)

The runtime expects one JPEG per landmark `type` listed in
`server/shared/monumentCatalog.js`. The full list:

```
charminar.jpg          golconda.jpg           hitec.jpg
burj_khalifa.jpg       burj_al_arab.jpg       gold_souk.jpg
vidhana_soudha.jpg     cubbon_park.jpg        tech_park.jpg
gateway_of_india.jpg   marine_drive.jpg       mumbai_local.jpg
times_square.jpg       empire_state.jpg       brooklyn_bridge.jpg
marina_bay_sands.jpg   supertrees.jpg         merlion.jpg
opera_house.jpg        harbour_bridge.jpg
```

Missing files: `MonumentBillboard.jsx` traps the load error and renders
nothing. The primitive landmark silhouette continues alone.

## Sourcing — Wikimedia Commons

All photos must be CC-BY-SA 4.0 or earlier (CC-BY 2.0/3.0/4.0 also fine).
Public domain (CC0) is preferred where available.

For each landmark:

1. Open https://commons.wikimedia.org/wiki/Special:Search?search=<landmark>
2. Pick a horizontal landscape shot, ideally 1024–2048 px wide.
3. Click "Download" → choose 1024 px size.
4. Note the `Author` and `License` fields.

## Standardise to ≤120 KB JPEG

```bash
# from the downloaded source
brew install imagemagick  # one-time
magick source.jpg -resize 1024x768^ -gravity center -extent 1024x768 -quality 80 charminar.jpg
```

Target: 1024 × 768, JPEG quality 80, ~80–120 KB.

## Update attribution

Each entry in `server/shared/monumentCatalog.js` already has a placeholder
`attribution` string. Replace with the actual Wikimedia author + license
when you commit the photo.

## Public attribution file

After every batch update, regenerate the public attribution file:

```bash
node scripts/generate-monument-attribution.js > client/public/images/monuments/ATTRIBUTION.md
```

(Script TBD — for now, hand-curate ATTRIBUTION.md from the catalog.)

## Verify

```bash
cd client && npm run dev
# Walk near Charminar (Hyderabad) — photo plane fades in past 12 m
# Walk away — primitive silhouette stays, photo fades out past 24 m
```
