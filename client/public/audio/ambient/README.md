# 🎵 City ambient tracks (Phase 10G)

The runtime expects 7 ambient loops at:

```
/audio/ambient/hyderabad.ogg
/audio/ambient/dubai.ogg
/audio/ambient/bengaluru.ogg
/audio/ambient/mumbai.ogg
/audio/ambient/newyork.ogg
/audio/ambient/singapore.ogg
/audio/ambient/sydney.ogg
```

If a file is missing, the SoundManager logs a load error once and silently
falls back through the chain (venue → city → silence). The MusicChip in
VenueInfoCard then hides itself for that location. Nothing crashes.

## Sourcing — CC0 first

Recommended sources (in priority order):

1. **Pixabay Music** — https://pixabay.com/music/ — search by genre + city tag.
   Filter to "License: Pixabay Content License" (CC0-equivalent).
2. **FreePD.com** — https://freepd.com/ — public domain ambient + cinematic.
3. **Bensound** — https://www.bensound.com/ — free with attribution (CC-BY).
   Use only when no CC0 alternative fits the city character.

## Suggested moods per city

| City | Mood | Search terms |
|---|---|---|
| Hyderabad | Indo-Persian, qawwali undertone, slow tabla | `qawwali ambient`, `sufi loop`, `indo persian` |
| Dubai | Oud + desert wind | `oud ambient`, `desert wind`, `arabic instrumental` |
| Bengaluru | South-Indian percussion, thavil + nadaswaram | `karnatik ambient`, `tabla loop`, `bangalore lounge` |
| Mumbai | Bombay jazz, vintage radio | `bombay jazz`, `vintage radio loop`, `india lounge` |
| New York | Late-night jazz, distant subway | `nyc jazz loop`, `late night jazz`, `urban ambient` |
| Singapore | Tropical, gamelan undertone | `gamelan ambient`, `tropical lounge`, `asian fusion` |
| Sydney | Beach lo-fi, acoustic guitar | `bondi lo-fi`, `australian beach`, `surf lounge` |

## Conversion to OGG (96 kbps mono recommended)

Most sources will give you MP3. Convert with `ffmpeg`:

```bash
ffmpeg -i hyderabad_source.mp3 -ac 1 -b:a 96k -ar 44100 hyderabad.ogg
```

Target file size: 600–900 KB per track (60–90 s loop @ 96 kbps mono).

## Attribution

If a track requires CC-BY credit, add it to the `musicCredit` field on the
matching entry in `server/shared/cityCatalog.js`:

```js
ambient: "/audio/ambient/hyderabad.ogg",
ambientCredit: "Track Title by Author Name (CC-BY 3.0) https://example.com/track",
```

The MusicChip will surface the credit string on hover (CC0 tracks omit it).

## Verify

```bash
cd client && npm run dev   # then enter any city — check the 🔊 chip in VenueInfoCard
curl http://localhost:3000/api/v1/llm/status  # confirms the catalog loads cleanly
```
