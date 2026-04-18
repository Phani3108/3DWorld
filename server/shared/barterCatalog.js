/**
 * Barter bundles — Phase 7I.
 *
 * Bundles are the step above plain bazaar items: a resident trades you
 * a themed pack (multiple emoji items + a coin reward + a ⚡ boost)
 * in exchange for coins PLUS proof you've learned about a matching
 * expertise tag (from the Phase 7E.6 conversation archive).
 *
 * The "proof" check keeps barter from being a coin dump — you must have
 * actually spoken to a resident who knows the topic. That creates a
 * subtle loop: learn first → trade better later.
 *
 * No LLM, no crafting — just a fixed catalog the server validates.
 */

export const BARTER_BUNDLES = {
  hyd_feast: {
    id: "hyd_feast", emoji: "🍛",
    name: "Hyderabad Feast Bundle",
    sellerId: "farah_hyd", cityId: "hyderabad",
    priceCoins: 120,
    requiresTag: "biryani",
    gives: {
      items: [
        { emoji: "🍛", label: "Family biryani handi" },
        { emoji: "🥣", label: "Bowl of haleem" },
        { emoji: "🫖", label: "Irani chai flask" },
      ],
      coinBonus: 15,
    },
    blurb: "Full Paradise feast. Comes with enough haleem to feed three friends.",
  },
  dxb_hospitality: {
    id: "dxb_hospitality", emoji: "🕌",
    name: "Gulf Hospitality Kit",
    sellerId: "omar_dxb", cityId: "dubai",
    priceCoins: 95,
    requiresTag: "gulf-hospitality",
    gives: {
      items: [
        { emoji: "☕", label: "Cardamom gahwa beans" },
        { emoji: "🟤", label: "Medjool dates box" },
        { emoji: "📜", label: "Majlis etiquette scroll" },
      ],
      coinBonus: 10,
    },
    blurb: "Everything you need to host a majlis in your own room.",
  },
  blr_decoction: {
    id: "blr_decoction", emoji: "☕",
    name: "Filter Coffee Starter",
    sellerId: "arjun_blr", cityId: "bengaluru",
    priceCoins: 60,
    requiresTag: "filter-coffee",
    gives: {
      items: [
        { emoji: "☕", label: "MTR decoction bottle" },
        { emoji: "🥛", label: "Milk sachet" },
        { emoji: "🥄", label: "Tumbler+dabarah set" },
      ],
      coinBonus: 6,
    },
    blurb: "South-Indian home-coffee kit. Pour the MTR way.",
  },
  mum_bombay: {
    id: "mum_bombay", emoji: "🌇",
    name: "Classic Bombay Bundle",
    sellerId: "dadi_mum", cityId: "mumbai",
    priceCoins: 90,
    requiresTag: "bombay-lore",
    gives: {
      items: [
        { emoji: "🍮", label: "Dadi's caramel custard" },
        { emoji: "🫐", label: "Zereshk jar" },
        { emoji: "📮", label: "Marine Drive postcard" },
      ],
      coinBonus: 10,
    },
    blurb: "A suitcase of Bombay — from Dadi's kitchen to your room.",
  },
  nyc_deli: {
    id: "nyc_deli", emoji: "🥪",
    name: "NYC Deli Classics",
    sellerId: "estelle_nyc", cityId: "newyork",
    priceCoins: 80,
    requiresTag: "nyc-delis",
    gives: {
      items: [
        { emoji: "🥒", label: "Full-sour pickle jar" },
        { emoji: "🥯", label: "Everything bagel dozen" },
        { emoji: "🥪", label: "Pastrami on rye coupon" },
      ],
      coinBonus: 12,
    },
    blurb: "Katz's plus Russ classics. Eat like a Lower East Side native.",
  },
  sg_hawker: {
    id: "sg_hawker", emoji: "🍜",
    name: "Hawker Centre Hop",
    sellerId: "mei_sg", cityId: "singapore",
    priceCoins: 70,
    requiresTag: "hawker-food",
    gives: {
      items: [
        { emoji: "🍚", label: "Chicken rice bowl" },
        { emoji: "🍜", label: "Katong laksa" },
        { emoji: "🧻", label: "Chope tissue pack" },
      ],
      coinBonus: 8,
    },
    blurb: "One-stop hawker tour. Chope responsibly.",
  },
  syd_arvo: {
    id: "syd_arvo", emoji: "🌊",
    name: "Bondi Arvo Bundle",
    sellerId: "maz_syd", cityId: "sydney",
    priceCoins: 75,
    requiresTag: "surf-culture",
    gives: {
      items: [
        { emoji: "🏄", label: "Surf wax bar" },
        { emoji: "🐟", label: "Fish & chips voucher" },
        { emoji: "☕", label: "Flat white token" },
      ],
      coinBonus: 8,
    },
    blurb: "Surf · chips · flat white. The perfect Bondi afternoon.",
  },
};

export const listBarterIds = () => Object.keys(BARTER_BUNDLES);
export const getBundle = (id) => BARTER_BUNDLES[id] || null;
export const bundlesInCity = (cityId) =>
  Object.values(BARTER_BUNDLES).filter((b) => b.cityId === cityId);
export const allBundlesPublic = () => Object.values(BARTER_BUNDLES);
