/**
 * Pitstop catalog — Phase 10D.
 *
 * Small mid-route conversation points placed BETWEEN venues so the
 * empty space across a city becomes engaging. Each pitstop has:
 *
 *   • position    — grid coords [x, z] in the city's room
 *   • kind        — visual archetype: "chai_stall" | "bus_stop" | "vista" | "fountain_bench" | "newsstand"
 *   • line        — the 1-line ambient "from a stranger nearby" message
 *   • theme       — short tag the chip displays ("waiting for the bus", "watching the sunset", etc.)
 *
 * Player proximity (≤ 2 grid cells) triggers a `pitstopPass` socket
 * event server-side, which in turn:
 *   • emits a chat bubble from PitStop:<id> with the line
 *   • grants +1 reputation in the city, daily-debounced per user/pitstop
 *   • appends a discreet world-feed entry
 *
 * Adding a pitstop = one entry in this file. Visuals reuse the existing
 * Prop registry types (newspaperStand, parkBench, fruitCart, etc.).
 */

export const PITSTOPS = {
  // ═══ Hyderabad ═════════════════════════════════════════════════════
  hyd_chai_corner: {
    id: "hyd_chai_corner",
    cityId: "hyderabad",
    position: [18, 33],
    kind: "chai_stall",
    prop: "fruitCart", // visually reuses fruitCart for now (orange cart vibe)
    theme: "chai stall",
    line: "Boss, ek cutting? Just brewed.",
  },
  hyd_minar_view: {
    id: "hyd_minar_view",
    cityId: "hyderabad",
    position: [34, 36],
    kind: "vista",
    prop: "parkBench",
    theme: "Charminar view",
    line: "Bhai, sunset at Charminar — wait five more minutes.",
  },
  hyd_news_stand: {
    id: "hyd_news_stand",
    cityId: "hyderabad",
    position: [22, 12],
    kind: "newsstand",
    prop: "newspaperStand",
    theme: "morning paper",
    line: "Aaj ka match dekha bhai? Boring tha.",
  },
  hyd_old_fountain: {
    id: "hyd_old_fountain",
    cityId: "hyderabad",
    position: [44, 34],
    kind: "fountain_bench",
    prop: "fountain",
    theme: "old fountain",
    line: "This fountain — older than my grandfather. They never cleaned it.",
  },

  // ═══ Dubai ═════════════════════════════════════════════════════════
  dxb_marina_bench: {
    id: "dxb_marina_bench",
    cityId: "dubai",
    position: [34, 14],
    kind: "vista",
    prop: "parkBench",
    theme: "marina view",
    line: "Walla, that yacht costs more than my whole village. Beautiful, no?",
  },
  dxb_souk_corner: {
    id: "dxb_souk_corner",
    cityId: "dubai",
    position: [42, 18],
    kind: "chai_stall",
    prop: "fruitCart",
    theme: "karak chai cart",
    line: "Habibi, karak chai? One dirham. Fastest sugar rush in the Gulf.",
  },
  dxb_metro_stop: {
    id: "dxb_metro_stop",
    cityId: "dubai",
    position: [22, 30],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "metro entrance",
    line: "Red Line that way → stops at Burj. Three dirhams.",
  },
  dxb_majlis_corner: {
    id: "dxb_majlis_corner",
    cityId: "dubai",
    position: [16, 46],
    kind: "fountain_bench",
    prop: "parkBench",
    theme: "majlis lawn",
    line: "Stars are clearer on the desert side. Past the towers, it opens up.",
  },

  // ═══ Bengaluru ═════════════════════════════════════════════════════
  blr_filter_corner: {
    id: "blr_filter_corner",
    cityId: "bengaluru",
    position: [20, 30],
    kind: "chai_stall",
    prop: "coffeeMachine",
    theme: "filter coffee cart",
    line: "Saar, filter coffee just decanted. Strong-light or medium?",
  },
  blr_park_bench: {
    id: "blr_park_bench",
    cityId: "bengaluru",
    position: [16, 16],
    kind: "vista",
    prop: "parkBench",
    theme: "Cubbon Park bench",
    line: "Sunday morning here, no cars. Magic for one hour.",
  },
  blr_bus_stop: {
    id: "blr_bus_stop",
    cityId: "bengaluru",
    position: [38, 22],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "BMTC bus stop",
    line: "335E to Whitefield in 12 minutes. Maybe 25 with traffic.",
  },
  blr_techie_corner: {
    id: "blr_techie_corner",
    cityId: "bengaluru",
    position: [44, 38],
    kind: "newsstand",
    prop: "newspaperStand",
    theme: "techie corner",
    line: "PR review between two beers? That's Bangalore.",
  },

  // ═══ Mumbai ════════════════════════════════════════════════════════
  mum_marine_dust: {
    id: "mum_marine_dust",
    cityId: "mumbai",
    position: [44, 12],
    kind: "vista",
    prop: "parkBench",
    theme: "Marine Drive bench",
    line: "Queen's Necklace switches on at 7. Wait for it bhai.",
  },
  mum_local_train: {
    id: "mum_local_train",
    cityId: "mumbai",
    position: [22, 30],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "local train platform",
    line: "Fast local in 4 minutes. Ladies' compartment second from front.",
  },
  mum_kala_ghoda: {
    id: "mum_kala_ghoda",
    cityId: "mumbai",
    position: [24, 42],
    kind: "newsstand",
    prop: "newspaperStand",
    theme: "Kala Ghoda corner",
    line: "Festival next month — every gallery has a queue. Come early.",
  },
  mum_chai_canister: {
    id: "mum_chai_canister",
    cityId: "mumbai",
    position: [16, 22],
    kind: "chai_stall",
    prop: "fruitCart",
    theme: "cutting chai cart",
    line: "Cutting chai, ten rupees. Keeps Mumbai running, bhai.",
  },

  // ═══ New York ══════════════════════════════════════════════════════
  nyc_subway_grate: {
    id: "nyc_subway_grate",
    cityId: "newyork",
    position: [22, 22],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "subway grate",
    line: "1 train two minutes. 6 train running local today, fyi.",
  },
  nyc_bagel_cart: {
    id: "nyc_bagel_cart",
    cityId: "newyork",
    position: [38, 18],
    kind: "chai_stall",
    prop: "fruitCart",
    theme: "bagel cart",
    line: "Bagel and cream cheese, four bucks. Fastest breakfast in midtown.",
  },
  nyc_central_park: {
    id: "nyc_central_park",
    cityId: "newyork",
    position: [16, 38],
    kind: "vista",
    prop: "parkBench",
    theme: "Central Park bench",
    line: "Saxophone guy plays on weekends. Tuesday's quieter, but the trees are louder.",
  },
  nyc_news_stand_42: {
    id: "nyc_news_stand_42",
    cityId: "newyork",
    position: [12, 30],
    kind: "newsstand",
    prop: "newspaperStand",
    theme: "42nd-st newsstand",
    line: "Yo, deadass — best dumpling spot two blocks east. No cap.",
  },

  // ═══ Singapore ═════════════════════════════════════════════════════
  sg_kopi_cart: {
    id: "sg_kopi_cart",
    cityId: "singapore",
    position: [18, 38],
    kind: "chai_stall",
    prop: "coffeeMachine",
    theme: "kopi cart",
    line: "Eh, kopi-c siu dai? One-twenty lah, eat already?",
  },
  sg_mrt_stop: {
    id: "sg_mrt_stop",
    cityId: "singapore",
    position: [30, 22],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "MRT exit",
    line: "Marina Bay this way, three stops. Tap your card already lah.",
  },
  sg_supertree_view: {
    id: "sg_supertree_view",
    cityId: "singapore",
    position: [44, 40],
    kind: "vista",
    prop: "parkBench",
    theme: "Supertree view",
    line: "Light show 7:45. Trust me, sit here, you'll thank me.",
  },
  sg_chope_corner: {
    id: "sg_chope_corner",
    cityId: "singapore",
    position: [22, 30],
    kind: "newsstand",
    prop: "newspaperStand",
    theme: "hawker queue",
    line: "Chope tissue first lah. Then queue — 15 min on a good day.",
  },

  // ═══ Sydney ════════════════════════════════════════════════════════
  syd_dawn_bench: {
    id: "syd_dawn_bench",
    cityId: "sydney",
    position: [26, 40],
    kind: "vista",
    prop: "parkBench",
    theme: "Bondi promenade",
    line: "Swell's clean this arvo, mate. Get in before the crowd.",
  },
  syd_coastal_kiosk: {
    id: "syd_coastal_kiosk",
    cityId: "sydney",
    position: [16, 38],
    kind: "chai_stall",
    prop: "fruitCart",
    theme: "coastal coffee cart",
    line: "Flat white, four bucks. Aussie law, mate.",
  },
  syd_ferry_dock: {
    id: "syd_ferry_dock",
    cityId: "sydney",
    position: [38, 14],
    kind: "bus_stop",
    prop: "informationKiosk",
    theme: "ferry dock",
    line: "Manly ferry in twelve minutes. Cheapest harbour cruise in the world.",
  },
  syd_opera_view: {
    id: "syd_opera_view",
    cityId: "sydney",
    position: [40, 24],
    kind: "vista",
    prop: "parkBench",
    theme: "harbour view",
    line: "Sunrise behind the bridge. Worth the 5:30 alarm, ey.",
  },
};

export const listPitstopIds = () => Object.keys(PITSTOPS);
export const getPitstop = (id) => PITSTOPS[id] || null;
export const pitstopsInCity = (cityId) =>
  Object.values(PITSTOPS).filter((p) => p.cityId === cityId);
export const allPitstopsPublic = () => Object.values(PITSTOPS);
