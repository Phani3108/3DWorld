/**
 * Venue layouts — per-venue prop placements that give each space its look.
 *
 * Kept separate from venueCatalog.js so that file stays focused on copy,
 * menus and canned Q&A. publicVenue() in venueCatalog.js merges this data
 * in as `layout: [...]` when serving a venue over the REST API.
 *
 * Each entry is { prop, grid: [x, z], rotation? } where `prop` must map to
 * a type registered in client/src/components/props/Prop.jsx and `grid` is
 * in the city room's grid-cell coordinates (same coordinate space as the
 * venue footprint).
 */

export const VENUE_LAYOUTS = {
  // ═══════ HYDERABAD ═════════════════════════════════════════════════
  hyd_paradise_biryani: [
    // Counter + kitchen along north side of footprint (22..32, 22..32)
    { prop: "kitchenCounter", grid: [30, 23] },
    { prop: "orderingWindow", grid: [30, 26], rotation: 1 },
    { prop: "menuBoard",      grid: [23, 22], rotation: 0 },
    // Two tables with chairs
    { prop: "tableRestaurant", grid: [24, 26] },
    { prop: "chairRestaurant", grid: [23, 26] },
    { prop: "chairRestaurant", grid: [25, 26] },
    { prop: "tableRestaurant", grid: [24, 29] },
    { prop: "chairRestaurant", grid: [23, 29] },
    { prop: "chairRestaurant", grid: [25, 29] },
    // Plants bracketing entrance
    { prop: "flowerPot",       grid: [22, 30] },
    { prop: "flowerPot",       grid: [31, 30] },
    // A photo spot outside
    { prop: "photoSpot",       grid: [28, 30] },
  ],

  hyd_niloufer_cafe: [
    // Footprint 10..16, 40..46
    { prop: "coffeeMachine",  grid: [14, 41] },
    { prop: "kitchenCounter", grid: [14, 42] },
    { prop: "menuBoard",      grid: [11, 40], rotation: 0 },
    // Small round bar-style seating
    { prop: "tableRestaurant", grid: [11, 43] },
    { prop: "chairRestaurant", grid: [10, 43] },
    { prop: "chairRestaurant", grid: [12, 43] },
    // Outside: one bench + a lamp
    { prop: "parkBench",   grid: [12, 45] },
    { prop: "streetLamp",  grid: [10, 44] },
  ],

  // ═══════ DUBAI ═════════════════════════════════════════════════════
  dxb_gold_souk: [
    // Footprint 42..50, 8..14
    { prop: "goldCounter", grid: [43, 9] },
    { prop: "goldCounter", grid: [46, 9] },
    { prop: "goldCounter", grid: [43, 12] },
    { prop: "goldCounter", grid: [46, 12] },
    { prop: "textileRoll", grid: [48, 10] },
    { prop: "streetLamp",  grid: [44, 13] },
    { prop: "streetLamp",  grid: [47, 13] },
    { prop: "informationKiosk", grid: [49, 11] },
  ],

  dxb_desert_majlis: [
    // Footprint 10..16, 48..53
    // Low cushion seating arranged in a U + centrepiece fountain
    { prop: "fountain",   grid: [13, 50] },
    { prop: "parkBench",  grid: [11, 49] },
    { prop: "parkBench",  grid: [15, 49] },
    { prop: "parkBench",  grid: [13, 52], rotation: 2 },
    { prop: "flowerPot",  grid: [10, 48] },
    { prop: "flowerPot",  grid: [16, 48] },
    { prop: "streetLamp", grid: [11, 52] },
    { prop: "streetLamp", grid: [15, 52] },
  ],

  // ═══════ BENGALURU ═════════════════════════════════════════════════
  blr_mtr: [
    // Footprint 22..32, 22..32
    { prop: "kitchenCounter", grid: [30, 23] },
    { prop: "coffeeMachine",  grid: [30, 26] },
    { prop: "menuBoard",      grid: [23, 22] },
    { prop: "tableRestaurant", grid: [24, 26] },
    { prop: "chairRestaurant", grid: [23, 26] },
    { prop: "chairRestaurant", grid: [25, 26] },
    { prop: "tableRestaurant", grid: [27, 29] },
    { prop: "chairRestaurant", grid: [26, 29] },
    { prop: "chairRestaurant", grid: [28, 29] },
    { prop: "treeSmall",      grid: [22, 31] },
    { prop: "flowerPot",      grid: [31, 30] },
  ],

  blr_church_street_pub: [
    // Footprint 42..49, 42..48
    { prop: "kitchenCounter", grid: [47, 43] },
    { prop: "coffeeMachine",  grid: [47, 45] },
    { prop: "menuBoard",      grid: [43, 42] },
    { prop: "tableRestaurant", grid: [44, 46] },
    { prop: "chairRestaurant", grid: [43, 46] },
    { prop: "chairRestaurant", grid: [45, 46] },
    { prop: "venueBillboard", grid: [45, 42] },
    { prop: "streetLamp",     grid: [42, 47] },
  ],

  // ═══════ MUMBAI ═════════════════════════════════════════════════════
  mum_britannia: [
    // Footprint 28..36, 42..48
    { prop: "kitchenCounter", grid: [34, 43] },
    { prop: "menuBoard",      grid: [29, 42] },
    { prop: "tableRestaurant", grid: [30, 45] },
    { prop: "chairRestaurant", grid: [29, 45] },
    { prop: "chairRestaurant", grid: [31, 45] },
    { prop: "tableRestaurant", grid: [33, 47] },
    { prop: "chairRestaurant", grid: [32, 47] },
    { prop: "chairRestaurant", grid: [34, 47] },
    { prop: "flowerPot",      grid: [28, 47] },
    { prop: "parkBench",      grid: [35, 47] },
  ],

  mum_chowpatty_stall: [
    // Footprint 12..17, 18..22 — street stall + beach edge
    { prop: "hawkerStall",     grid: [14, 19] },
    { prop: "fruitCart",       grid: [13, 21] },
    { prop: "parkBench",       grid: [15, 21] },
    { prop: "streetLamp",      grid: [12, 21] },
    { prop: "newspaperStand",  grid: [16, 20] },
  ],

  // ═══════ NEW YORK ═══════════════════════════════════════════════════
  nyc_katz: [
    // Footprint 22..32, 22..32
    { prop: "kitchenCounter", grid: [30, 23] },
    { prop: "orderingWindow", grid: [30, 26], rotation: 1 },
    { prop: "menuBoard",      grid: [23, 22] },
    { prop: "tableRestaurant", grid: [24, 26] },
    { prop: "chairRestaurant", grid: [23, 26] },
    { prop: "chairRestaurant", grid: [25, 26] },
    { prop: "tableRestaurant", grid: [27, 29] },
    { prop: "chairRestaurant", grid: [26, 29] },
    { prop: "chairRestaurant", grid: [28, 29] },
    { prop: "venueBillboard", grid: [30, 30] },
  ],

  nyc_bodega: [
    // Footprint 42..48, 12..17
    { prop: "kitchenCounter", grid: [46, 13] },
    { prop: "coffeeMachine",  grid: [46, 15] },
    { prop: "fruitCart",      grid: [43, 16] },
    { prop: "newspaperStand", grid: [43, 13] },
    { prop: "trashBinStreet", grid: [47, 16] },
    { prop: "streetLamp",     grid: [42, 14] },
    { prop: "fireHydrant",    grid: [48, 16] },
  ],

  // ═══════ SINGAPORE ══════════════════════════════════════════════════
  sg_lau_pa_sat: [
    // Footprint 22..32, 22..32 — hawker centre grid of stalls
    { prop: "hawkerStall",    grid: [23, 23] },
    { prop: "hawkerStall",    grid: [27, 23] },
    { prop: "hawkerStall",    grid: [31, 23], rotation: 2 },
    { prop: "tableRestaurant", grid: [24, 27] },
    { prop: "chairRestaurant", grid: [23, 27] },
    { prop: "chairRestaurant", grid: [25, 27] },
    { prop: "tableRestaurant", grid: [28, 27] },
    { prop: "chairRestaurant", grid: [27, 27] },
    { prop: "chairRestaurant", grid: [29, 27] },
    { prop: "fruitCart",      grid: [26, 30] },
  ],

  sg_kopitiam: [
    // Footprint 10..16, 42..47
    { prop: "kitchenCounter", grid: [14, 43] },
    { prop: "coffeeMachine",  grid: [14, 44] },
    { prop: "menuBoard",      grid: [11, 42] },
    { prop: "tableRestaurant", grid: [11, 45] },
    { prop: "chairRestaurant", grid: [10, 45] },
    { prop: "chairRestaurant", grid: [12, 45] },
    { prop: "treeSmall",      grid: [10, 46] },
  ],

  // ═══════ SYDNEY ═════════════════════════════════════════════════════
  syd_bondi_chippery: [
    // Footprint 22..32, 42..46 — beach front
    { prop: "kitchenCounter", grid: [28, 43] },
    { prop: "orderingWindow", grid: [28, 45], rotation: 1 },
    { prop: "surfboardRack",  grid: [23, 43] },
    { prop: "beachUmbrella",  grid: [25, 45] },
    { prop: "beachUmbrella",  grid: [30, 45] },
    { prop: "parkBench",      grid: [24, 44] },
    { prop: "souvenirStall",  grid: [31, 44] },
  ],

  syd_barista_lab: [
    // Footprint 40..46, 22..27
    { prop: "coffeeMachine",  grid: [44, 23] },
    { prop: "kitchenCounter", grid: [44, 25] },
    { prop: "menuBoard",      grid: [41, 22] },
    { prop: "tableRestaurant", grid: [41, 25] },
    { prop: "chairRestaurant", grid: [40, 25] },
    { prop: "chairRestaurant", grid: [42, 25] },
    { prop: "flowerPot",      grid: [40, 26] },
    { prop: "flowerPot",      grid: [45, 26] },
  ],
};

/** @param {string} venueId @returns {Array} layout entries or empty */
export const getLayout = (venueId) => VENUE_LAYOUTS[venueId] || [];
