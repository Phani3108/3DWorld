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
    role: "host",
    expertise: ["biryani", "dum-cooking", "kachche-gosht", "haleem", "hyderabadi-urdu"],
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
    role: "host",
    expertise: ["irani-chai", "hyderabadi-urdu", "cricket", "ramzan-iftar"],
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
    role: "host",
    expertise: ["gold-trading", "karat-testing", "gulf-arabic", "gulf-hospitality"],
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
    role: "host",
    expertise: ["bedouin-lore", "gulf-hospitality", "stars-navigation", "arabic-coffee", "philosophy"],
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
    role: "host",
    expertise: ["filter-coffee", "south-indian", "kannada", "story-telling"],
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
    role: "host",
    expertise: ["indie-music", "craft-beer", "tech-bengaluru", "kannada"],
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
    role: "host",
    expertise: ["parsi-cuisine", "parsi-history", "bombay-lore", "story-telling"],
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
    role: "host",
    expertise: ["street-food", "bombay-tapori", "cutting-chai", "cricket"],
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
    role: "host",
    expertise: ["pastrami", "nyc-delis", "nyc-slang", "jazz-nyc"],
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
    role: "host",
    expertise: ["bodega-culture", "bagel-culture", "nyc-slang", "story-telling"],
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
    role: "host",
    expertise: ["hawker-food", "chicken-rice", "laksa", "singlish", "chope-culture"],
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
    role: "host",
    expertise: ["kopi-codes", "kaya-toast", "kopitiam", "singlish"],
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
    role: "host",
    expertise: ["bondi-surf", "surf-culture", "fish-and-chips", "aussie-slang"],
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
    role: "host",
    expertise: ["flat-white", "third-wave", "filter-coffee", "aussie-slang"],
    routine: "barista",
    defaultLines: [
      "Reckon you want a flat white? Yeah, everyone does.",
      "This Yirgacheffe's tasting like bergamot today.",
      "60–65°C milk — trust me, not hotter.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Phase 7E.4 — one regular per venue. `role: "regular"`. Same schema;
  // they walk the same routines but their personal canned Q&A lives in
  // shared/residentQA.js so Ask-an-Agent targeting them answers in their
  // own voice before falling through to the venue bank.
  // ═══════════════════════════════════════════════════════════════════
  naseem_hyd: {
    id: "naseem_hyd",   name: "Naseem",
    cityId: "hyderabad", homeVenueId: "hyd_niloufer_cafe",
    avatarUrl: A.work,   accentId: "slate",
    bio: "Chess regular at Niloufer. Beats every uncle on the corner.",
    role: "regular",
    expertise: ["chess", "hyderabadi-urdu", "political-banter", "cricket"],
    routine: "chat_stall",
    defaultLines: [
      "Shatranj khelega bhai? Chai meri.",
      "Naya politics wala drama dekha? Baigan hai.",
      "Board laga diya — pehla move tera.",
    ],
  },
  zara_hyd: {
    id: "zara_hyd",     name: "Zara",
    cityId: "hyderabad", homeVenueId: "hyd_paradise_biryani",
    avatarUrl: A.cozy,   accentId: "rose",
    bio: "Dum-cook at Paradise. Saffron smuggler. Farah's right hand.",
    role: "regular",
    expertise: ["dum-cooking", "kachche-gosht", "biryani"],
    routine: "host",
    defaultLines: [
      "Saffron aaj thoda mehenga, Farah ko mat batana.",
      "Kachche gosht — ek timing wrong and sab kharab.",
      "Dum khula mat karna, bhai. Steam jaata hai.",
    ],
  },

  khalid_dxb: {
    id: "khalid_dxb",   name: "Khalid",
    cityId: "dubai",     homeVenueId: "dxb_gold_souk",
    avatarUrl: A.work,   accentId: "slate",
    bio: "Gold weigher at the souk. Third-generation karat tester.",
    role: "regular",
    expertise: ["karat-testing", "gold-trading", "gulf-arabic"],
    routine: "market",
    defaultLines: [
      "Bring it to the scale, habibi. We'll see.",
      "22-carat feels heavier on the thumb. Trust me.",
      "Hallmark is here — small, under the clasp.",
    ],
  },
  aisha_dxb: {
    id: "aisha_dxb",    name: "Aisha",
    cityId: "dubai",     homeVenueId: "dxb_desert_majlis",
    avatarUrl: A.casual, accentId: "violet",
    bio: "Oud player, Emirati poet. Knows every majlis song.",
    role: "regular",
    expertise: ["oud", "poetry", "gulf-hospitality", "arabic-coffee"],
    routine: "majlis",
    defaultLines: [
      "Marhaba — ek ghazal sunu?",
      "The oud wants a quiet audience, habibi.",
      "Coffee and poetry — the only two that take time.",
    ],
  },

  ravi_blr: {
    id: "ravi_blr",     name: "Ravi",
    cityId: "bengaluru", homeVenueId: "blr_mtr",
    avatarUrl: A.work,   accentId: "amber",
    bio: "Morning regular at MTR. Filter coffee decanter, tiffin scholar.",
    role: "regular",
    expertise: ["filter-coffee", "south-indian", "kannada", "story-telling"],
    routine: "chat_stall",
    defaultLines: [
      "Saar — decoction ratio matters more than beans.",
      "Rava idli vs dosa — dosa, everyday.",
      "Kannada swalpa seeko — beku means want.",
    ],
  },
  anu_blr: {
    id: "anu_blr",      name: "Anu",
    cityId: "bengaluru", homeVenueId: "blr_church_street_pub",
    avatarUrl: A.casual, accentId: "violet",
    bio: "Indie drummer. Gigs on weekends, codes on weekdays.",
    role: "regular",
    expertise: ["indie-music", "craft-beer", "tech-bengaluru"],
    routine: "pub",
    defaultLines: [
      "Thermal set-list tonight, maga.",
      "This IPA has too much citrus — who did this.",
      "Reviewing a PR between two beers. Perks.",
    ],
  },

  dadi_mum: {
    id: "dadi_mum",     name: "Dadi",
    cityId: "mumbai",    homeVenueId: "mum_britannia",
    avatarUrl: A.cozy,   accentId: "rose",
    bio: "Parsi matriarch. Fourth-gen berry pulao maker. Priya's elder aunt.",
    role: "regular",
    expertise: ["parsi-cuisine", "parsi-history", "bombay-lore", "story-telling"],
    routine: "host",
    defaultLines: [
      "Dikra — zereshk from Yazd, not Iran-Iran. Dadaji knew.",
      "Bombay was quieter in the 60s. You had time.",
      "Caramel custard — don't burn. Colour of mahogany.",
    ],
  },
  salman_mum: {
    id: "salman_mum",   name: "Salman",
    cityId: "mumbai",    homeVenueId: "mum_chowpatty_stall",
    avatarUrl: A.work,   accentId: "orange",
    bio: "Cabbie on Marine Drive. Knows every Bollywood film set location.",
    role: "regular",
    expertise: ["bombay-tapori", "local-trains", "cricket", "bombay-lore"],
    routine: "street_vendor",
    defaultLines: [
      "Local mein seat milegi kya is time? Sochle.",
      "Aaj Virat ne kya kiya bhai — hundred, no?",
      "Marine Drive pe queen's necklace, bindaas view.",
    ],
  },

  estelle_nyc: {
    id: "estelle_nyc",  name: "Estelle",
    cityId: "newyork",   homeVenueId: "nyc_katz",
    avatarUrl: A.cozy,   accentId: "teal",
    bio: "Pickle queen of the Lower East Side. Third-gen deli regular.",
    role: "regular",
    expertise: ["pickling", "nyc-delis", "lower-east-side", "story-telling"],
    routine: "chat_stall",
    defaultLines: [
      "Two weeks for half-sour, six for full. Don't rush it.",
      "My grandmother's recipe — dill, garlic, salt. No vinegar.",
      "Orchard Street before the condos — that was a street.",
    ],
  },
  reggie_nyc: {
    id: "reggie_nyc",   name: "DJ Reggie",
    cityId: "newyork",   homeVenueId: "nyc_bodega",
    avatarUrl: A.smart,  accentId: "violet",
    bio: "Bodega regular, hip-hop DJ, corner-historian.",
    role: "regular",
    expertise: ["hip-hop", "bodega-culture", "nyc-slang", "jazz-nyc"],
    routine: "market",
    defaultLines: [
      "Yo — Bronx cassette mixtape, 1982, deadass.",
      "Bodega's the third place, my guy. Home, work, here.",
      "New York slang changes every five years. Keep up.",
    ],
  },

  xiao_ming_sg: {
    id: "xiao_ming_sg", name: "Xiao Ming",
    cityId: "singapore", homeVenueId: "sg_kopitiam",
    avatarUrl: A.smart,  accentId: "orange",
    bio: "Kopi trainee learning from Uncle Lim. Speaks Hokkien at home.",
    role: "regular",
    expertise: ["kopi-codes", "hokkien", "singlish", "kopitiam"],
    routine: "barista",
    defaultLines: [
      "Uncle Lim say my froth still not thick enough.",
      "Hokkien ah — 'chim' means deep, like the kopi.",
      "Kopi-c siu dai peng — one! Coming up lah.",
    ],
  },
  priya_sg: {
    id: "priya_sg",     name: "Priya (Aunty)",
    cityId: "singapore", homeVenueId: "sg_lau_pa_sat",
    avatarUrl: A.cozy,   accentId: "amber",
    bio: "Indian hawker aunty at Lau Pa Sat. Runs the laksa & roti stall.",
    role: "regular",
    expertise: ["laksa", "chicken-rice", "chope-culture", "singlish"],
    routine: "hawker",
    defaultLines: [
      "Eh my laksa better than the stall over there lor.",
      "Chope the table first, order later. Don't skip.",
      "Roti prata? Two plain one egg, can.",
    ],
  },

  maz_syd: {
    id: "maz_syd",      name: "Maz",
    cityId: "sydney",    homeVenueId: "syd_bondi_chippery",
    avatarUrl: A.casual, accentId: "sky",
    bio: "Local Bondi surfer. 6 a.m. paddle, 9 a.m. flat white, 11 a.m. chips.",
    role: "regular",
    expertise: ["bondi-surf", "surf-culture", "fish-and-chips", "aussie-slang"],
    routine: "host",
    defaultLines: [
      "Swell's pumping this arvo, mate. Get in early.",
      "Chicken salt on the chips or bust, ey.",
      "Saturday's a bit crowded — go before 7.",
    ],
  },
  ari_syd: {
    id: "ari_syd",      name: "Ari",
    cityId: "sydney",    homeVenueId: "syd_barista_lab",
    avatarUrl: A.smart,  accentId: "emerald",
    bio: "Third-wave barista-in-training. Obsessed with extraction ratios.",
    role: "regular",
    expertise: ["espresso-science", "flat-white", "third-wave", "coffee-craft"],
    routine: "barista",
    defaultLines: [
      "1:2 ratio, 28 seconds — chef's kiss.",
      "This Geisha's got jasmine all over the cup.",
      "Reckon light roast beats dark every time.",
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
    role: r.role || "host",                 // Phase 7E.2
    expertise: Array.isArray(r.expertise) ? r.expertise : [],
  };
};

/** @returns {Array} all residents, public-safe projection. */
export const allResidentsPublic = () => Object.values(RESIDENTS).map(publicResident);

/** Filter residents by a single expertise tag. */
export const residentsByExpertise = (tag) => {
  if (!tag) return [];
  return Object.values(RESIDENTS).filter(
    (r) => Array.isArray(r.expertise) && r.expertise.includes(tag),
  );
};
