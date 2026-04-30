# 📸 Screenshot capture guide

The README references images at fixed paths. Drop your captures into this
directory using the filenames below and they will appear automatically.

| File | What to capture | Why |
|---|---|---|
| `01-world-map.png` | The opening **WorldMap** showing all 7 cities with people-counts | "This is the world" |
| `02-paradise-hyderabad.png` | Walked into **Paradise Biryani**, VenueInfoCard slid in showing Farah's greeting + 🎯 quest chip + 📍 hotspot | "This is what a venue feels like" |
| `03-conversation.png` | The chat bubble above Farah after asking a seed — plus the 🧠 toast in the corner | "Asking yields knowledge" |
| `04-knowledge-bulletin.png` | Bulletin board open on the **🧠 Knowledge** tab with tag chip filters visible | "Everyone's knowledge is searchable" |
| `05-quests-panel.png` | QuestsPanel showing one Active (with progress bar), three Offers, one Completed | "Goals + progression" |
| `06-travel-panel.png` | TravelPanel showing the rep gates (Dubai 75, NYC 25), discounted prices for high-rep cities | "Reputation → mobility" |
| `07-bazaar.png` | BazaarPanel on the **🎁 Bundles** tab showing the knowledge-gated trade UI | "Novel barter mechanic" |
| `08-profile.png` | ProfileCard for a player who's been around — shows tier bar, reputation chips, recent threads, persona tags | "Your passport in the world" |

## Animated GIF (header of README)

Capture **`hero.gif`** (this directory) — ~30 seconds, ~800 px wide:

1. Start on the WorldMap, hover Hyderabad → click pin
2. Camera flies over, lands at street level
3. Walk into Paradise — VenueInfoCard slides in with quest chip
4. Click the quest accept button → 🎯 toast
5. Click an Ask seed → Farah replies in chat
6. Open the bulletin board → 🧠 Knowledge tab → see the new entry
7. Open Travel → switch city to Dubai
8. Land in Dubai, walk into the Gold Souk

Tools that work well: **Cleanshot** (Mac), **LICEcap** (cross-platform),
**ScreenToGif** (Windows). Aim for ~10 fps, ~3 MB.

## Resolution & format

- PNG screenshots: 1440×900 or 1920×1080, retina if available, < 500 KB each.
- GIF: 800 px wide, < 5 MB. (For larger demo videos, host on YouTube and embed.)
- Run `pngquant --quality=70-85 *.png` before committing to keep the repo lean.

## Privacy

Use anonymous demo names (Alice, Bob, Tester) in shots — they end up on the
public README forever. Avoid IPs, real emails, or anything that could
identify a private tester.
