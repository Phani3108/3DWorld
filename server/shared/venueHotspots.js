/**
 * Venue hotspots — named positions inside a venue with an affordance.
 *
 * Kept alongside venueLayouts.js so layout + hotspots stay in sync
 * visually. When a character's grid position lands within the hotspot
 * `radius` (default 2 cells), server/socketHandlers.js emits a
 * `hotspotEnter` / `hotspotExit` to the mover so the VenueInfoCard
 * can surface the affordance as a one-tap action.
 *
 * Affordance kinds:
 *   • "order"          — fire the food-buy flow for the venue host
 *   • "sit_and_chat"   — chat with nearby resident(s), seed chips
 *   • "pose_together"  — composable photo spot (Phase 6 ScreenshotButton)
 *   • "listen"         — auto-subscribe to ambient conversations (7E.5)
 *   • "lean_on_counter"— host-lite: casual chat entry
 *
 * Each entry: { id, grid: [x, z], kind, capacity?, label, radius? }
 */

export const VENUE_HOTSPOTS = {
  // ═══════ HYDERABAD ═════════════════════════════════════════════════
  hyd_paradise_biryani: [
    { id: "counter",  grid: [30, 24], kind: "order",          capacity: 1, label: "Order at the counter" },
    { id: "table_1",  grid: [24, 26], kind: "sit_and_chat",   capacity: 4, label: "Sit with Farah" },
    { id: "photo",    grid: [28, 30], kind: "pose_together",  capacity: 3, label: "Photo spot" },
  ],
  hyd_niloufer_cafe: [
    { id: "counter",  grid: [14, 41], kind: "lean_on_counter",capacity: 1, label: "Lean on the Niloufer counter" },
    { id: "table_1",  grid: [11, 43], kind: "sit_and_chat",   capacity: 3, label: "Sit with Asad & crew" },
    { id: "bench",    grid: [12, 45], kind: "listen",         capacity: 2, label: "Bench outside" },
  ],

  // ═══════ DUBAI ═════════════════════════════════════════════════════
  dxb_gold_souk: [
    { id: "counter_a", grid: [43, 9],  kind: "lean_on_counter",capacity: 1, label: "Lean on Layla's counter" },
    { id: "counter_b", grid: [46, 9],  kind: "order",         capacity: 1, label: "Ask about a piece" },
    { id: "kiosk",     grid: [49, 11], kind: "listen",        capacity: 2, label: "Info kiosk" },
  ],
  dxb_desert_majlis: [
    { id: "fountain",  grid: [13, 50], kind: "pose_together", capacity: 4, label: "Photo by the fountain" },
    { id: "bench_n",   grid: [11, 49], kind: "sit_and_chat",  capacity: 2, label: "Sit with Omar" },
    { id: "bench_s",   grid: [13, 52], kind: "listen",        capacity: 2, label: "Listen under the stars" },
  ],

  // ═══════ BENGALURU ═════════════════════════════════════════════════
  blr_mtr: [
    { id: "counter",  grid: [30, 24], kind: "order",         capacity: 1, label: "Order at MTR" },
    { id: "table_1",  grid: [24, 26], kind: "sit_and_chat",  capacity: 3, label: "Sit with Arjun" },
    { id: "table_2",  grid: [27, 29], kind: "sit_and_chat",  capacity: 3, label: "Corner table" },
  ],
  blr_church_street_pub: [
    { id: "bar",      grid: [47, 44], kind: "lean_on_counter",capacity: 1, label: "Lean on the bar" },
    { id: "table_1",  grid: [44, 46], kind: "sit_and_chat",  capacity: 3, label: "Sit with Divya" },
    { id: "stage",    grid: [45, 42], kind: "pose_together", capacity: 4, label: "Under the billboard" },
  ],

  // ═══════ MUMBAI ═════════════════════════════════════════════════════
  mum_britannia: [
    { id: "counter",  grid: [34, 43], kind: "order",         capacity: 1, label: "Order at the counter" },
    { id: "table_1",  grid: [30, 45], kind: "sit_and_chat",  capacity: 3, label: "Sit with Priya" },
    { id: "bench",    grid: [35, 47], kind: "listen",        capacity: 2, label: "Bench by the door" },
  ],
  mum_chowpatty_stall: [
    { id: "stall",    grid: [14, 19], kind: "order",         capacity: 1, label: "Grab a vada pav" },
    { id: "bench",    grid: [15, 21], kind: "sit_and_chat",  capacity: 2, label: "Sit with Rohan" },
    { id: "cart",     grid: [13, 21], kind: "pose_together", capacity: 3, label: "Photo by the cart" },
  ],

  // ═══════ NEW YORK ═══════════════════════════════════════════════════
  nyc_katz: [
    { id: "counter",  grid: [30, 24], kind: "order",         capacity: 1, label: "Order at the counter" },
    { id: "table_13", grid: [24, 26], kind: "sit_and_chat",  capacity: 4, label: "Table 13 with Marcus" },
    { id: "photo",    grid: [30, 30], kind: "pose_together", capacity: 3, label: "Famous sign" },
  ],
  nyc_bodega: [
    { id: "counter",  grid: [46, 14], kind: "order",         capacity: 1, label: "Grab-and-go counter" },
    { id: "fruit",    grid: [43, 16], kind: "sit_and_chat",  capacity: 2, label: "Chat with Sasha" },
    { id: "stoop",    grid: [47, 16], kind: "listen",        capacity: 2, label: "Stoop outside" },
  ],

  // ═══════ SINGAPORE ══════════════════════════════════════════════════
  sg_lau_pa_sat: [
    { id: "stall_a",  grid: [23, 23], kind: "order",         capacity: 1, label: "Order at Mei's stall" },
    { id: "stall_b",  grid: [27, 23], kind: "order",         capacity: 1, label: "Other hawker stall" },
    { id: "table_1",  grid: [24, 27], kind: "sit_and_chat",  capacity: 3, label: "Chope this table" },
    { id: "table_2",  grid: [28, 27], kind: "sit_and_chat",  capacity: 3, label: "Corner chope" },
  ],
  sg_kopitiam: [
    { id: "counter",  grid: [14, 43], kind: "lean_on_counter",capacity: 1, label: "Lean on Uncle Lim's counter" },
    { id: "table_1",  grid: [11, 45], kind: "sit_and_chat",  capacity: 3, label: "Morning paper table" },
  ],

  // ═══════ SYDNEY ═════════════════════════════════════════════════════
  syd_bondi_chippery: [
    { id: "counter",  grid: [28, 44], kind: "order",         capacity: 1, label: "Order fish & chips" },
    { id: "umbrella", grid: [25, 45], kind: "sit_and_chat",  capacity: 4, label: "Sit with Jack" },
    { id: "boards",   grid: [23, 43], kind: "pose_together", capacity: 3, label: "Surfboard photo" },
  ],
  syd_barista_lab: [
    { id: "bar",      grid: [44, 24], kind: "lean_on_counter",capacity: 1, label: "Watch Nat pull a shot" },
    { id: "table_1",  grid: [41, 25], kind: "sit_and_chat",  capacity: 3, label: "Sit with Nat" },
  ],

  // ═════════════ Phase 7D — tourist venues ═════════════════════════════
  hyd_charminar_bazaar: [
    { id: "photo",    grid: [42, 34], kind: "pose_together",  capacity: 5, label: "Photo at Charminar" },
    { id: "bazaar",   grid: [44, 35], kind: "listen",         capacity: 3, label: "Souvenir stalls" },
  ],
  mum_marine_drive_walk: [
    { id: "bench_a",  grid: [42, 11], kind: "sit_and_chat",   capacity: 2, label: "Bench — Queen's Necklace view" },
    { id: "bench_b",  grid: [45, 11], kind: "sit_and_chat",   capacity: 2, label: "Bench — mid-promenade" },
    { id: "photo",    grid: [46, 13], kind: "pose_together",  capacity: 4, label: "Sunset photo spot" },
  ],
  blr_cubbon_park: [
    { id: "fountain", grid: [16, 16], kind: "pose_together",  capacity: 5, label: "Fountain circle" },
    { id: "bench",    grid: [16, 15], kind: "sit_and_chat",   capacity: 2, label: "Bench under the gulmohar" },
    { id: "listen",   grid: [15, 18], kind: "listen",         capacity: 3, label: "Listen to birds" },
  ],
  dxb_marina_promenade: [
    { id: "umbrella", grid: [32, 12], kind: "sit_and_chat",   capacity: 2, label: "Umbrella at the yachts" },
    { id: "photo",    grid: [34, 13], kind: "pose_together",  capacity: 4, label: "Skyline photo" },
    { id: "souvenir", grid: [37, 13], kind: "listen",         capacity: 2, label: "Souvenir stalls" },
  ],
  nyc_times_square: [
    { id: "photo",    grid: [13, 34], kind: "pose_together",  capacity: 5, label: "Photo under the billboards" },
    { id: "newspaper",grid: [13, 36], kind: "listen",         capacity: 2, label: "Grab a paper" },
    { id: "billboard",grid: [12, 33], kind: "listen",         capacity: 3, label: "Watch the LED wall" },
  ],
  sg_gardens_by_the_bay: [
    { id: "fountain", grid: [43, 39], kind: "pose_together",  capacity: 5, label: "Photo by the Supertree fountain" },
    { id: "bench_a",  grid: [42, 37], kind: "sit_and_chat",   capacity: 2, label: "Bench in the grove" },
    { id: "bench_b",  grid: [44, 37], kind: "listen",         capacity: 2, label: "Bench in the shade" },
  ],
  syd_opera_forecourt: [
    { id: "photo",    grid: [37, 14], kind: "pose_together",  capacity: 5, label: "Iconic Opera House photo" },
    { id: "bench_a",  grid: [35, 14], kind: "sit_and_chat",   capacity: 2, label: "Bench with the harbour view" },
    { id: "info",     grid: [40, 16], kind: "listen",         capacity: 2, label: "Visitor info kiosk" },
  ],
};

const HOTSPOT_DEFAULT_RADIUS = 2;

/**
 * @param {string} venueId
 * @returns {Array} hotspot entries, or empty array
 */
export const getHotspots = (venueId) => VENUE_HOTSPOTS[venueId] || [];

/**
 * Find the closest hotspot within `radius` of the given grid position.
 * Uses manhattan-ish Euclidean distance squared on the 2D grid.
 *
 * @param {string} venueId
 * @param {[number, number]} gridPos
 * @returns {object|null} hotspot entry + distance, or null
 */
export const findClosestHotspot = (venueId, gridPos) => {
  if (!venueId || !Array.isArray(gridPos) || gridPos.length < 2) return null;
  const hotspots = getHotspots(venueId);
  if (hotspots.length === 0) return null;
  const [x, z] = gridPos;
  if (typeof x !== "number" || typeof z !== "number") return null;

  let best = null;
  let bestDistSq = Infinity;
  for (const h of hotspots) {
    const r = typeof h.radius === "number" ? h.radius : HOTSPOT_DEFAULT_RADIUS;
    const dx = x - h.grid[0];
    const dz = z - h.grid[1];
    const distSq = dx * dx + dz * dz;
    if (distSq > r * r) continue;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = h;
    }
  }
  return best;
};
