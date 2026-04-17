/**
 * Food catalog — signature dishes per city.
 * Consumed by /api/v1/food endpoints and the client FoodPanel.
 * Motive deltas piggyback on the Sims-style `satisfies` shape already used
 * by shared/roomConstants.js OBJECT_AFFORDANCES.
 */

export const FOOD_CATALOG = {
  // ── Hyderabad ──────────────────────────────────
  biryani: {
    id: "biryani", name: "Hyderabadi Biryani", city: "hyderabad", emoji: "🍛",
    price: 25, satisfies: { hunger: 40, fun: 10 }, duration: 4000,
    description: "Dum-cooked long-grain rice with mutton or chicken, saffron, mint.",
  },
  iraniChai: {
    id: "iraniChai", name: "Irani Chai", city: "hyderabad", emoji: "☕",
    price: 5, satisfies: { energy: 25, social: 5 }, duration: 2000,
    description: "Slow-brewed tea with khoya, best at a cafe that's at least 80 years old.",
  },
  haleem: {
    id: "haleem", name: "Haleem", city: "hyderabad", emoji: "🥣",
    price: 20, satisfies: { hunger: 35, energy: 10 }, duration: 3500,
    description: "Slow-cooked wheat, lentils and meat — only in Ramzan, never otherwise.",
  },
  osmaniaBiscuit: {
    id: "osmaniaBiscuit", name: "Osmania Biscuit", city: "hyderabad", emoji: "🍪",
    price: 3, satisfies: { fun: 10 }, duration: 1500,
    description: "Sweet-salt biscuit to dunk in your chai.",
  },

  // ── Dubai ──────────────────────────────────────
  shawarma: {
    id: "shawarma", name: "Shawarma", city: "dubai", emoji: "🌯",
    price: 15, satisfies: { hunger: 30 }, duration: 3000,
    description: "Rotisserie chicken or beef, garlic sauce, pickles, in a soft wrap.",
  },
  luqaimat: {
    id: "luqaimat", name: "Luqaimat", city: "dubai", emoji: "🍩",
    price: 8, satisfies: { fun: 15 }, duration: 2000,
    description: "Crispy dough balls soaked in date syrup — small bites of sugar.",
  },
  arabicCoffee: {
    id: "arabicCoffee", name: "Arabic Coffee + Dates", city: "dubai", emoji: "☕",
    price: 6, satisfies: { energy: 20, social: 10 }, duration: 2000,
    description: "Cardamom-spiced gahwa with khalas dates.",
  },
  camelMilkChocolate: {
    id: "camelMilkChocolate", name: "Camel-Milk Chocolate", city: "dubai", emoji: "🍫",
    price: 10, satisfies: { fun: 15 }, duration: 1500,
    description: "Only-in-the-Gulf treat — creamy and slightly tangy.",
  },

  // ── Bengaluru ──────────────────────────────────
  masalaDosa: {
    id: "masalaDosa", name: "Masala Dosa", city: "bengaluru", emoji: "🥞",
    price: 15, satisfies: { hunger: 30, fun: 10 }, duration: 3000,
    description: "Crispy rice-lentil crepe wrapped around spiced potato.",
  },
  filterCoffee: {
    id: "filterCoffee", name: "Filter Coffee", city: "bengaluru", emoji: "☕",
    price: 8, satisfies: { energy: 30 }, duration: 2000,
    description: "Decoction + boiled milk served in a dabarah-tumbler.",
  },
  mysorePak: {
    id: "mysorePak", name: "Mysore Pak", city: "bengaluru", emoji: "🍬",
    price: 6, satisfies: { fun: 20 }, duration: 1500,
    description: "Ghee-soaked besan fudge, square-cut and dense.",
  },
  bisiBeleBath: {
    id: "bisiBeleBath", name: "Bisi Bele Bath", city: "bengaluru", emoji: "🍲",
    price: 18, satisfies: { hunger: 35, energy: 10 }, duration: 3500,
    description: "Rice, lentils, tamarind, ghee — one-pot warmth.",
  },

  // ── Mumbai ─────────────────────────────────────
  vadaPav: {
    id: "vadaPav", name: "Vada Pav", city: "mumbai", emoji: "🥪",
    price: 10, satisfies: { hunger: 25, fun: 5 }, duration: 2500,
    description: "Spiced potato fritter in a pav with garlic-peanut chutney.",
  },
  cuttingChai: {
    id: "cuttingChai", name: "Cutting Chai", city: "mumbai", emoji: "🍵",
    price: 5, satisfies: { energy: 20, social: 10 }, duration: 2000,
    description: "Half a glass of strong spiced tea — the commute companion.",
  },
  pavBhaji: {
    id: "pavBhaji", name: "Pav Bhaji", city: "mumbai", emoji: "🍲",
    price: 18, satisfies: { hunger: 35 }, duration: 3000,
    description: "Buttery mashed-veg curry with toasted pav.",
  },
  bhelPuri: {
    id: "bhelPuri", name: "Bhel Puri", city: "mumbai", emoji: "🥗",
    price: 12, satisfies: { hunger: 20, fun: 10 }, duration: 2500,
    description: "Puffed rice, sev, tamarind and mint — chaat on a beach.",
  },

  // ── New York ───────────────────────────────────
  nySlice: {
    id: "nySlice", name: "NY Slice", city: "newyork", emoji: "🍕",
    price: 12, satisfies: { hunger: 35 }, duration: 3000,
    description: "Thin-crust, foldable, eaten walking.",
  },
  pretzel: {
    id: "pretzel", name: "Soft Pretzel", city: "newyork", emoji: "🥨",
    price: 6, satisfies: { hunger: 15, fun: 10 }, duration: 2000,
    description: "Salt-flecked knot, yellow mustard on the side.",
  },
  bagel: {
    id: "bagel", name: "Bagel with Cream Cheese", city: "newyork", emoji: "🥯",
    price: 8, satisfies: { hunger: 25, energy: 10 }, duration: 2500,
    description: "Boiled-then-baked, the New York water makes it.",
  },
  hotDog: {
    id: "hotDog", name: "Hot Dog", city: "newyork", emoji: "🌭",
    price: 7, satisfies: { hunger: 20, fun: 10 }, duration: 2000,
    description: "Steamed dog in a bun, mustard + sauerkraut optional.",
  },

  // ── Singapore ──────────────────────────────────
  chickenRice: {
    id: "chickenRice", name: "Hainanese Chicken Rice", city: "singapore", emoji: "🍚",
    price: 18, satisfies: { hunger: 40 }, duration: 3500,
    description: "Poached chicken, fragrant rice, chili-ginger condiment trio.",
  },
  laksa: {
    id: "laksa", name: "Laksa", city: "singapore", emoji: "🍜",
    price: 15, satisfies: { hunger: 35, fun: 10 }, duration: 3500,
    description: "Coconut noodle soup with prawns and tofu puffs.",
  },
  kayaToast: {
    id: "kayaToast", name: "Kaya Toast", city: "singapore", emoji: "🍞",
    price: 8, satisfies: { hunger: 15, fun: 10 }, duration: 2000,
    description: "Charcoal-grilled toast with pandan-coconut jam and a slab of cold butter.",
  },
  kopi: {
    id: "kopi", name: "Kopi", city: "singapore", emoji: "☕",
    price: 5, satisfies: { energy: 25 }, duration: 2000,
    description: "Kopitiam-style coffee with condensed milk.",
  },

  // ── Sydney ─────────────────────────────────────
  meatPie: {
    id: "meatPie", name: "Meat Pie", city: "sydney", emoji: "🥧",
    price: 14, satisfies: { hunger: 30 }, duration: 3000,
    description: "Hot mince-and-gravy pie, dead horse (tomato sauce) on top.",
  },
  flatWhite: {
    id: "flatWhite", name: "Flat White", city: "sydney", emoji: "☕",
    price: 7, satisfies: { energy: 25, social: 5 }, duration: 2000,
    description: "Double espresso with micro-foam, poured for a rosetta.",
  },
  lamington: {
    id: "lamington", name: "Lamington", city: "sydney", emoji: "🎂",
    price: 6, satisfies: { fun: 15 }, duration: 1500,
    description: "Sponge cube dipped in chocolate and rolled in coconut.",
  },
  fishAndChips: {
    id: "fishAndChips", name: "Fish & Chips", city: "sydney", emoji: "🍟",
    price: 16, satisfies: { hunger: 35 }, duration: 3000,
    description: "Beer-battered barramundi, chunky chips, lemon wedge.",
  },
};

/** @returns {string[]} all food IDs */
export const listFoodIds = () => Object.keys(FOOD_CATALOG);

/** @param {string} cityId @returns {Array} foods for a given city */
export const foodsForCity = (cityId) =>
  Object.values(FOOD_CATALOG).filter((f) => f.city === cityId);

/** @param {string} foodId */
export const getFood = (foodId) => FOOD_CATALOG[foodId] || null;
