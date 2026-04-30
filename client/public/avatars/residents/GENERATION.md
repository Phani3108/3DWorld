# 🎨 Resident portrait generation (Phase 10F prep)

The runtime will look for stylised AI-illustrated portraits at:

```
/avatars/residents/{residentId}.webp
```

For each of the 28 residents in `server/shared/residentCatalog.js`. Slice
10F itself ships in a later push — this file documents the **batch
generation prompt template** so portraits are ready when 10F lands.

## Style brief (locked from Phase 10 plan)

> Warm painterly portrait, neutral lighting, slightly stylised, 3/4 angle,
> soft brushwork, no logos, no text, no nameplate. Subject takes up
> roughly 70% of the frame, neutral background suggesting the resident's
> home city without being literal.

## Per-resident prompt template

```
A {age} {ethnicity} {gender} character named {name},
{role} at {venueName} in {cityName}.
{bio}
Wearing clothing typical of their venue + role.
Style: warm painterly portrait, soft brushwork, neutral lighting,
slightly stylised, 3/4 angle, subject takes up 70% of frame,
neutral background suggesting {cityName} without being literal.
512×512, no logos, no text, no nameplate.
```

Fill `{age}`, `{ethnicity}`, `{gender}` from a curator's reading of
`bio` + `cityId`. Hyderabadi host = South Asian, Singapore hawker
aunty = Chinese-Singaporean, etc. Be culturally specific, not stereotyped.

## Tools

- **DALL-E 3** via OpenAI API — `~$0.04` per 1024² image, run at 512²
  by post-resize. Total batch ≈ $1.12 for 28 portraits.
- **Stable Diffusion XL** locally — free, slower, requires GPU. Use the
  `realisticVisionV60B1` checkpoint for the warm-painterly look.
- **Midjourney v6** — best quality for the painterly brief, requires
  Discord account + paid plan.

## Storage

After generation:

```bash
# Resize each portrait + convert to WebP
for f in raw/*.png; do
  base=$(basename "$f" .png)
  magick "$f" -resize 512x512 -quality 75 "client/public/avatars/residents/${base}.webp"
done
```

Target file size: 30–50 KB per portrait.

## Roster

| residentId | name | role | cityId | venueName |
|---|---|---|---|---|
| farah_hyd | Farah | host | hyderabad | Paradise Biryani |
| asad_hyd | Asad | host | hyderabad | Niloufer Café |
| layla_dxb | Layla | host | dubai | Gold Souk |
| omar_dxb | Omar | host | dubai | Desert Majlis |
| arjun_blr | Arjun | host | bengaluru | MTR |
| divya_blr | Divya | host | bengaluru | Church Street Pub |
| priya_mum | Priya | host | mumbai | Britannia & Co. |
| rohan_mum | Rohan | host | mumbai | Chowpatty Vada Pav |
| marcus_nyc | Marcus | host | newyork | Katz's Delicatessen |
| sasha_nyc | Sasha | host | newyork | Corner Bodega |
| mei_sg | Mei | host | singapore | Lau Pa Sat |
| uncle_lim_sg | Uncle Lim | host | singapore | Old Kopitiam |
| jack_syd | Jack | host | sydney | Bondi Chippery |
| nat_syd | Nat | host | sydney | Barista Lab |
| naseem_hyd | Naseem | regular | hyderabad | Niloufer Café |
| zara_hyd | Zara | regular | hyderabad | Paradise Biryani |
| khalid_dxb | Khalid | regular | dubai | Gold Souk |
| aisha_dxb | Aisha | regular | dubai | Desert Majlis |
| ravi_blr | Ravi | regular | bengaluru | MTR |
| anu_blr | Anu | regular | bengaluru | Church Street Pub |
| dadi_mum | Dadi | regular | mumbai | Britannia & Co. |
| salman_mum | Salman | regular | mumbai | Chowpatty Vada Pav |
| estelle_nyc | Estelle | regular | newyork | Katz's Delicatessen |
| reggie_nyc | DJ Reggie | regular | newyork | Corner Bodega |
| xiao_ming_sg | Xiao Ming | regular | singapore | Old Kopitiam |
| priya_sg | Priya (Aunty) | regular | singapore | Lau Pa Sat |
| maz_syd | Maz | regular | sydney | Bondi Chippery |
| ari_syd | Ari | regular | sydney | Barista Lab |

## Verify (after 10F ships)

```bash
cd client && npm run dev
# Walk near any resident — circular photo billboard above their head
# (currently this billboard layer doesn't exist yet — slice 10F)
```
