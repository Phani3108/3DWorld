/**
 * Resident catalog — 14 named agents seeded at server boot.
 *
 * Each resident is a regular `isBot: true` user + a botRegistry entry (with
 * no webhookUrl, so Ask-an-Agent falls through to the venue canned-answer
 * bank from Phase 6). They walk a small routine in their home venue, greet
 * arrivals, and stand where you'd expect the host to be.
 *
 * Adding a resident = add one entry + an optional line in residentRoutines.
 */

// Reuse the existing 5 catalog avatars — sanitizeAvatarUrl accepts them.
const A = {
  cat:     "/models/sillyNubCat.glb",
  casual:  "https://models.readyplayer.me/64f0265b1db75f90dcfd9e2c.glb",
  smart:   "https://models.readyplayer.me/663833cf6c79010563b91e1b.glb",
  cozy:    "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb",
  work:    "https://models.readyplayer.me/64a3f54c1d64e9f3dbc832ac.glb",
};

export const RESIDENTS = {
  // ═══════ Hyderabad ═══════════════════════════════════════════════
  farah_hyd: {
    id: "farah_hyd",     name: "Farah",
    cityId: "hyderabad", homeVenueId: "hyd_paradise_biryani",
    avatarUrl: A.smart,  accentId: "amber",
    bio: "Host at Paradise Biryani House. Talks biryani and weather.",
    routine: "host",
    defaultLines: [
      "Aadab sahab — biryani garam aa raha hai.",
      "Queue lambi hai bhai, par worth it.",
      "Sahab, haleem bhi try karo.",
    ],
  },
  asad_hyd: {
    id: "asad_hyd",      name: "Asad",
    cityId: "hyderabad", homeVenueId: "hyd_niloufer_cafe",
    avatarUrl: A.casual, accentId: "rose",
    bio: "Niloufer counter uncle. Cricket and chai.",
    routine: "chat_stall",
    defaultLines: [
      "Kaiku late aayein bhai? Chai special?",
      "Osmania biscuit dunkne ke liye hai.",
      "Match dekha kya, bolo?",
    ],
  },

  // ═══════ Dubai ════════════════════════════════════════════════════
  layla_dxb: {
    id: "layla_dxb",   name: "Layla",
    cityId: "dubai",   homeVenueId: "dxb_gold_souk",
    avatarUrl: A.cozy, accentId: "amber",
    bio: "Gold Souk merchant. Never in a rush.",
    routine: "market",
    defaultLines: [
      "Ahlan habibi — 22 carat today, yes?",
      "Walla, special price for you only.",
      "Coffee first, then we talk gold.",
    ],
  },
  omar_dxb: {
    id: "omar_dxb",    name: "Omar",
    cityId: "dubai",   homeVenueId: "dxb_desert_majlis",
    avatarUrl: A.work, accentId: "slate",
    bio: "Majlis host. Stars, patience, stories.",
    routine: "majlis",
    defaultLines: [
      "Marhaba. Sit, sit. Gahwa?",
      "Inshallah we'll talk about the stars.",
      "Slow, habibi — time doesn't hurry here.",
    ],
  },

  // ═══════ Bengaluru ════════════════════════════════════════════════
  arjun_blr: {
    id: "arjun_blr",    name: "Arjun",
    cityId: "bengaluru", homeVenueId: "blr_mtr",
    avatarUrl: A.smart, accentId: "emerald",
    bio: "MTR floor captain. Filter coffee evangelist.",
    routine: "host",
    defaultLines: [
      "Namaskara! Dosa ready in five.",
      "Saar — filter coffee properly pour maadi.",
      "Rava idli was born here, dikra.",
    ],
  },
  divya_blr: {
    id: "divya_blr",    name: "Divya",
    cityId: "bengaluru", homeVenueId: "blr_church_street_pub",
    avatarUrl: A.cozy,  accentId: "violet",
    bio: "Weekend bartender. Indie music nerd.",
    routine: "pub",
    defaultLines: [
      "Hey maga, surviving the traffic?",
      "Toit or Arbor — take a pick.",
      "Thermal and a Quarter playing Friday, come.",
    ],
  },

  // ═══════ Mumbai ═══════════════════════════════════════════════════
  priya_mum: {
    id: "priya_mum",    name: "Priya",
    cityId: "mumbai",   homeVenueId: "mum_britannia",
    avatarUrl: A.casual, accentId: "rose",
    bio: "Britannia's fourth-gen owner. Full of stories.",
    routine: "host",
    defaultLines: [
      "Aavjo dikra — berry pulao ready.",
      "Caramel custard is my grandmother's.",
      "Bombay hasn't really changed, only looks different.",
    ],
  },
  rohan_mum: {
    id: "rohan_mum",   name: "Rohan",
    cityId: "mumbai",  homeVenueId: "mum_chowpatty_stall",
    avatarUrl: A.work, accentId: "orange",
    bio: "Chowpatty vada pav fast-talker.",
    routine: "street_vendor",
    defaultLines: [
      "Aye bhai! Vada pav garam hai — tikha?",
      "Ek vada pav ekdum jhakaas hai.",
      "Cutting chai lega? Fatafat!",
    ],
  },

  // ═══════ New York ═════════════════════════════════════════════════
  marcus_nyc: {
    id: "marcus_nyc",  name: "Marcus",
    cityId: "newyork", homeVenueId: "nyc_katz",
    avatarUrl: A.work, accentId: "slate",
    bio: "Katz's counter guy. Dry humour.",
    routine: "host",
    defaultLines: [
      "What can I get ya? C'mon, there's a line.",
      "Pastrami on rye, mustard — you got it.",
      "Table 13, yeah, yeah, we know.",
    ],
  },
  sasha_nyc: {
    id: "sasha_nyc",    name: "Sasha",
    cityId: "newyork",  homeVenueId: "nyc_bodega",
    avatarUrl: A.casual, accentId: "teal",
    bio: "Bodega owner. Knows every regular.",
    routine: "market",
    defaultLines: [
      "Yo, the usual? Bacon-egg-cheese?",
      "Meatball's napping on the chip aisle again.",
      "Deadass, we got everything.",
    ],
  },

  // ═══════ Singapore ════════════════════════════════════════════════
  mei_sg: {
    id: "mei_sg",      name: "Mei",
    cityId: "singapore", homeVenueId: "sg_lau_pa_sat",
    avatarUrl: A.cozy,   accentId: "orange",
    bio: "Hawker aunty. Efficient.",
    routine: "hawker",
    defaultLines: [
      "Eh, chicken rice one lah? Chili separate lor.",
      "Wah shiok today, queue short.",
      "Chope the table first, then order.",
    ],
  },
  uncle_lim_sg: {
    id: "uncle_lim_sg", name: "Uncle Lim",
    cityId: "singapore", homeVenueId: "sg_kopitiam",
    avatarUrl: A.work,   accentId: "amber",
    bio: "Kopitiam regular. Teaches kopi codes.",
    routine: "chat_stall",
    defaultLines: [
      "Kopi hor? Tell me how you like.",
      "Kaya toast crispy today, best one.",
      "Tiong Bahru morning best time ah.",
    ],
  },

  // ═══════ Sydney ═══════════════════════════════════════════════════
  jack_syd: {
    id: "jack_syd",    name: "Jack",
    cityId: "sydney",  homeVenueId: "syd_bondi_chippery",
    avatarUrl: A.smart, accentId: "sky",
    bio: "Chippery surfer. Laid-back.",
    routine: "host",
    defaultLines: [
      "G'day mate — fish and chips, proper wrapped?",
      "Surf's been decent this arvo.",
      "Chicken salt? No worries, heaps.",
    ],
  },
  nat_syd: {
    id: "nat_syd",      name: "Nat",
    cityId: "sydney",   homeVenueId: "syd_barista_lab",
    avatarUrl: A.casual, accentId: "emerald",
    bio: "Barista Lab owner. Coffee nerd.",
    routine: "barista",
    defaultLines: [
      "Reckon you want a flat white? Yeah, everyone does.",
      "This Yirgacheffe's tasting like bergamot today.",
      "60–65°C milk — trust me, not hotter.",
    ],
  },
};

/** @returns {string[]} all resident IDs */
export const listResidentIds = () => Object.keys(RESIDENTS);

/** @returns {object|null} */
export const getResident = (id) => RESIDENTS[id] || null;

/** All residents in a given city. */
export const residentsInCity = (cityId) =>
  Object.values(RESIDENTS).filter((r) => r.cityId === cityId);

/** Public projection (safe to send to clients). */
export const publicResident = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    cityId: r.cityId,
    homeVenueId: r.homeVenueId,
    avatarUrl: r.avatarUrl,
    accentId: r.accentId,
    bio: r.bio,
    routine: r.routine,
  };
};

/** @returns {Array} all residents, public-safe projection. */
export const allResidentsPublic = () => Object.values(RESIDENTS).map(publicResident);
