/**
 * Bazaar catalog — Phase 7G.
 *
 * Coins-only marketplace. Each entry is a small item a resident "sells"
 * from their venue. Purchase = coins deducted + item added to user's
 * inventory under a new `bazaar` bucket (so it stays separate from
 * Phase 4 `food` tokens that carry satisfies/motive effects).
 *
 * No LLM and no dynamic pricing — entries are static. This is a demo
 * shopfront that makes coins feel like they mean something, nothing more.
 */

export const BAZAAR_ITEMS = {
  // Hyderabad
  pearl_bracelet: {
    id: "pearl_bracelet", emoji: "📿",
    name: "Hyderabadi Pearl Bracelet",
    sellerId: "farah_hyd", cityId: "hyderabad", venueId: "hyd_paradise_biryani",
    price: 40,
    blurb: "Natural pearls from the old city markets. Small, freshwater, lustrous.",
  },
  saffron_pinch: {
    id: "saffron_pinch", emoji: "🌾",
    name: "Pinch of Kashmiri Saffron",
    sellerId: "zara_hyd", cityId: "hyderabad", venueId: "hyd_paradise_biryani",
    price: 25,
    blurb: "Enough for one dum handi. Bright orange threads.",
  },

  // Dubai
  dates_box: {
    id: "dates_box", emoji: "🟤",
    name: "Medjool Dates Box",
    sellerId: "layla_dxb", cityId: "dubai", venueId: "dxb_gold_souk",
    price: 18,
    blurb: "Eight plump dates, cardamom-dusted. Pair with gahwa.",
  },
  oud_strings: {
    id: "oud_strings", emoji: "🎵",
    name: "Oud String Set",
    sellerId: "aisha_dxb", cityId: "dubai", venueId: "dxb_desert_majlis",
    price: 35,
    blurb: "Eleven nylon+silver strings. Aisha's preferred gauge.",
  },

  // Bengaluru
  coffee_decoction: {
    id: "coffee_decoction", emoji: "☕",
    name: "MTR Decoction Bottle",
    sellerId: "arjun_blr", cityId: "bengaluru", venueId: "blr_mtr",
    price: 12,
    blurb: "Take-home filter coffee concentrate. Add milk, pour tumbler-to-dabarah.",
  },
  tabla_stickers: {
    id: "tabla_stickers", emoji: "🎶",
    name: "Indie Gig Sticker Pack",
    sellerId: "anu_blr", cityId: "bengaluru", venueId: "blr_church_street_pub",
    price: 8,
    blurb: "Six stickers from Bengaluru's best small venues.",
  },

  // Mumbai
  zereshk_jar: {
    id: "zereshk_jar", emoji: "🫐",
    name: "Zereshk (Barberry) Jar",
    sellerId: "dadi_mum", cityId: "mumbai", venueId: "mum_britannia",
    price: 30,
    blurb: "100 g sour Iranian barberries. Enough for four berry pulaos.",
  },
  marine_postcard: {
    id: "marine_postcard", emoji: "📮",
    name: "Marine Drive Postcard",
    sellerId: "salman_mum", cityId: "mumbai", venueId: "mum_chowpatty_stall",
    price: 5,
    blurb: "Queen's Necklace at dusk, captured on film.",
  },

  // New York
  pickle_jar: {
    id: "pickle_jar", emoji: "🥒",
    name: "Full-Sour Pickle Jar",
    sellerId: "estelle_nyc", cityId: "newyork", venueId: "nyc_katz",
    price: 15,
    blurb: "Six weeks in Estelle's brine. Dill, garlic, salt. No vinegar.",
  },
  mixtape_82: {
    id: "mixtape_82", emoji: "📼",
    name: "1982 Bronx Mixtape",
    sellerId: "reggie_nyc", cityId: "newyork", venueId: "nyc_bodega",
    price: 22,
    blurb: "Cassette rip, cleaned by Reggie. Kool Herc era breakbeats.",
  },

  // Singapore
  kopi_bag: {
    id: "kopi_bag", emoji: "🫘",
    name: "Kopitiam Kopi Bag",
    sellerId: "uncle_lim_sg", cityId: "singapore", venueId: "sg_kopitiam",
    price: 14,
    blurb: "Charcoal-roasted robusta, 250 g. Strong enough to stand a spoon.",
  },
  chope_tissue: {
    id: "chope_tissue", emoji: "🧻",
    name: "Artisan Chope Tissue",
    sellerId: "priya_sg", cityId: "singapore", venueId: "sg_lau_pa_sat",
    price: 3,
    blurb: "For reserving tables. Respect the rule.",
  },

  // Sydney
  surf_wax: {
    id: "surf_wax", emoji: "🏄",
    name: "Bondi Surf Wax",
    sellerId: "maz_syd", cityId: "sydney", venueId: "syd_bondi_chippery",
    price: 10,
    blurb: "Warm-water formula. Smells like coconut and ambition.",
  },
  espresso_beans: {
    id: "espresso_beans", emoji: "☕",
    name: "Single-Origin Espresso (250 g)",
    sellerId: "ari_syd", cityId: "sydney", venueId: "syd_barista_lab",
    price: 28,
    blurb: "Ethiopian Yirgacheffe, light roast. Jasmine and peach.",
  },
};

export const listBazaarIds = () => Object.keys(BAZAAR_ITEMS);
export const getBazaarItem = (id) => BAZAAR_ITEMS[id] || null;
export const bazaarInCity = (cityId) =>
  Object.values(BAZAAR_ITEMS).filter((b) => b.cityId === cityId);
export const bazaarBySeller = (sellerId) =>
  Object.values(BAZAAR_ITEMS).filter((b) => b.sellerId === sellerId);
export const allBazaarPublic = () => Object.values(BAZAAR_ITEMS);
