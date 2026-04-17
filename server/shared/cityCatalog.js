/**
 * City catalog — data-first definition of the 7 themed public rooms.
 * Consumed by server (roomCache hydration) and client (theme + world map).
 *
 * Adding a city = add a new entry here and one landmark component per landmark
 * on the client. No logic changes anywhere else.
 */

export const CITIES = {
  hyderabad: {
    id: "hyderabad",
    name: "Hyderabad",
    country: "India",
    emoji: "🏛️",
    tagline: "City of Nizams — pearls, biryani and Charminar at sunset",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#f4c274", ground: "#d98838", accent: "#ef4444" },
    ambient: "/audio/ambient/hyderabad.mp3",
    skybox: "/textures/skybox/hyderabad.jpg",
    mapPosition: { x: 0.63, y: 0.42 }, // normalized coords on world map (0-1)
    landmarks: [
      { type: "charminar",    footprint: { x: 28, z: 28, w: 8, d: 8 } },
      { type: "golcondaArch", footprint: { x: 10, z: 40, w: 6, d: 4 } },
      { type: "hitecTower",   footprint: { x: 45, z: 10, w: 5, d: 5 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "farah_hyd",
    menu: ["biryani", "iraniChai", "haleem", "osmaniaBiscuit"],
    defaultEmotes: ["namaste", "dance"],
    funFacts: [
      "Charminar was built in 1591 to mark the end of a deadly plague.",
      "Hyderabadi biryani is cooked in a sealed pot using the dum method.",
      "The Golconda Fort has acoustics so precise, a handclap at the entrance echoes at the top.",
    ],
  },

  dubai: {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    emoji: "🏙️",
    tagline: "Desert turned skyline — souks, sand and tallest tower in the world",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#fde68a", ground: "#e7c28a", accent: "#d4a017" },
    ambient: "/audio/ambient/dubai.mp3",
    skybox: "/textures/skybox/dubai.jpg",
    mapPosition: { x: 0.58, y: 0.38 },
    landmarks: [
      { type: "burjKhalifa", footprint: { x: 30, z: 30, w: 4, d: 4 } },
      { type: "burjAlArab",  footprint: { x: 10, z: 45, w: 6, d: 4 } },
      { type: "goldSouk",    footprint: { x: 45, z: 8,  w: 8, d: 4 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "layla_dxb",
    menu: ["shawarma", "luqaimat", "arabicCoffee", "camelMilkChocolate"],
    defaultEmotes: ["salaam", "bow"],
    funFacts: [
      "Burj Khalifa is 828 m tall — you can see 95 km on a clear day.",
      "The Dubai Gold Souk has over 300 shops and trades around 10 tonnes of gold at any moment.",
      "Dubai's metro is one of the longest fully-automated driverless networks.",
    ],
  },

  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    country: "India",
    emoji: "🌳",
    tagline: "Garden City — filter coffee, pubs, rain and a lot of code",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#bbf7d0", ground: "#7ba35f", accent: "#dc2626" },
    ambient: "/audio/ambient/bengaluru.mp3",
    skybox: "/textures/skybox/bengaluru.jpg",
    mapPosition: { x: 0.625, y: 0.48 },
    landmarks: [
      { type: "vidhanaSoudha", footprint: { x: 28, z: 28, w: 8, d: 6 } },
      { type: "cubbonPark",    footprint: { x: 8,  z: 10, w: 14, d: 10 } },
      { type: "techPark",      footprint: { x: 45, z: 42, w: 6, d: 6 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "arjun_blr",
    menu: ["masalaDosa", "filterCoffee", "mysorePak", "bisiBeleBath"],
    defaultEmotes: ["namaste", "think"],
    funFacts: [
      "Bengaluru is called the Silicon Valley of India — home to 40%+ of India's IT exports.",
      "Cubbon Park covers 300 acres and has over 6,000 trees.",
      "Filter coffee is brewed in a dabarah-tumbler that was designed for quick heat loss so nothing burns your tongue.",
    ],
  },

  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    emoji: "🌊",
    tagline: "Maximum City — seven islands of dreams, locals and monsoon chai",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#93c5fd", ground: "#94a3b8", accent: "#f59e0b" },
    ambient: "/audio/ambient/mumbai.mp3",
    skybox: "/textures/skybox/mumbai.jpg",
    mapPosition: { x: 0.605, y: 0.45 },
    landmarks: [
      { type: "gatewayOfIndia", footprint: { x: 30, z: 45, w: 8, d: 6 } },
      { type: "marineDrive",    footprint: { x: 8,  z: 20, w: 20, d: 3 } },
      { type: "localTrain",     footprint: { x: 45, z: 12, w: 10, d: 3 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "priya_mum",
    menu: ["vadaPav", "cuttingChai", "pavBhaji", "bhelPuri"],
    defaultEmotes: ["namaste", "laugh"],
    funFacts: [
      "Mumbai's local trains carry around 7.5 million commuters every single day.",
      "Marine Drive at night is called the Queen's Necklace because of how the street lights curve.",
      "Vada pav was invented in 1966 by a street vendor next to Dadar station.",
    ],
  },

  newyork: {
    id: "newyork",
    name: "New York",
    country: "USA",
    emoji: "🗽",
    tagline: "The city that never sleeps — bagels at 3 a.m., steam from manholes",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#94a3b8", ground: "#78716c", accent: "#facc15" },
    ambient: "/audio/ambient/newyork.mp3",
    skybox: "/textures/skybox/newyork.jpg",
    mapPosition: { x: 0.28, y: 0.40 },
    landmarks: [
      { type: "timesSquare",    footprint: { x: 28, z: 28, w: 8, d: 8 } },
      { type: "empireState",    footprint: { x: 10, z: 10, w: 4, d: 4 } },
      { type: "brooklynBridge", footprint: { x: 42, z: 42, w: 14, d: 4 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "marcus_nyc",
    menu: ["nySlice", "pretzel", "bagel", "hotDog"],
    defaultEmotes: ["wave", "point"],
    funFacts: [
      "The Empire State Building has 6,514 windows and its own ZIP code (10118).",
      "A NY slice is eaten folded — this is a municipal tradition, not a suggestion.",
      "Central Park is bigger than the entire country of Monaco.",
    ],
  },

  singapore: {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    emoji: "🌆",
    tagline: "Garden in a city — hawker stalls, supertrees, rain at 4 p.m.",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#a5f3fc", ground: "#e7e5e4", accent: "#ec4899" },
    ambient: "/audio/ambient/singapore.mp3",
    skybox: "/textures/skybox/singapore.jpg",
    mapPosition: { x: 0.73, y: 0.55 },
    landmarks: [
      { type: "marinaBaySands", footprint: { x: 28, z: 28, w: 10, d: 6 } },
      { type: "supertrees",     footprint: { x: 10, z: 40, w: 8,  d: 8 } },
      { type: "merlion",        footprint: { x: 45, z: 12, w: 3,  d: 3 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "mei_sg",
    menu: ["chickenRice", "laksa", "kayaToast", "kopi"],
    defaultEmotes: ["bow", "nod"],
    funFacts: [
      "Singapore has more than 50 hawker centres and two of them have Michelin stars.",
      "The Supertrees collect rainwater and generate solar power for Gardens by the Bay.",
      "It is illegal to chew gum here — and also to feed the monkeys.",
    ],
  },

  sydney: {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    emoji: "🏄",
    tagline: "Harbour and sails — flat whites, Bondi swells, opera in a shell",
    size: [60, 60],
    gridDivision: 2,
    palette: { sky: "#bae6fd", ground: "#fde68a", accent: "#10b981" },
    ambient: "/audio/ambient/sydney.mp3",
    skybox: "/textures/skybox/sydney.jpg",
    mapPosition: { x: 0.82, y: 0.72 },
    landmarks: [
      { type: "operaHouse",    footprint: { x: 28, z: 42, w: 10, d: 6 } },
      { type: "harbourBridge", footprint: { x: 10, z: 42, w: 16, d: 3 } },
    ],
    spawn: [30, 0, 40],
    greeterBot: "jack_syd",
    menu: ["meatPie", "flatWhite", "lamington", "fishAndChips"],
    defaultEmotes: ["wave", "cheer"],
    funFacts: [
      "The Opera House's roof is made of over 1 million Swedish-made tiles.",
      "Sydney Harbour Bridge is nicknamed 'the Coathanger' by locals.",
      "A proper flat white uses micro-foam so fine you can pour a ristretto rosetta.",
    ],
  },
};

/** @returns {string[]} all city IDs, in a stable order */
export const listCityIds = () => Object.keys(CITIES);

/** Public-projection of a city (safe to send to clients). */
export const publicCity = (city) => {
  if (!city) return null;
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    emoji: city.emoji,
    tagline: city.tagline,
    palette: city.palette,
    ambient: city.ambient,
    skybox: city.skybox,
    mapPosition: city.mapPosition,
    landmarks: city.landmarks,
    spawn: city.spawn,
    greeterBot: city.greeterBot,
    menu: city.menu,
    defaultEmotes: city.defaultEmotes,
    funFacts: city.funFacts,
    size: city.size,
    gridDivision: city.gridDivision,
  };
};

/** @returns {Array} public projection of all cities */
export const listCitiesPublic = () =>
  Object.values(CITIES).map(publicCity);

/** @returns {object|null} */
export const getCity = (cityId) => CITIES[cityId] || null;
