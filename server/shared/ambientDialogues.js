/**
 * Ambient dialogues — scripted 2-3-line mini-scenes between resident
 * pairs that fire periodically in each venue so the world feels lived-in
 * even when the local player is just standing around.
 *
 * Shape: venueId → Array<{ id, scene: Array<{ speakerId, line }> }>
 *
 * Timing (driven by residentService's ambient tick):
 *   • One scene per venue every ~30 s (wall-clock, per-venue).
 *   • Within a scene, lines fire 2-4 s apart so the banter reads
 *     naturally instead of arriving as a single burst.
 *   • If anyone in the venue has chatted in the last ~10 s the tick
 *     skips so real conversation takes priority.
 *   • Hidden from the archive — ambient chatter is atmosphere, not
 *     knowledge worth tagging (Phase 7E.6 captures only Ask answers).
 *
 * Adding a scene = one entry. speakerId must be a residentId that lives
 * in the same venue — residentService validates before firing.
 */

export const AMBIENT_DIALOGUES = {
  // ═══════ HYDERABAD ════════════════════════════════════════════════
  hyd_paradise_biryani: [
    {
      id: "dum_timing",
      scene: [
        { speakerId: "zara_hyd",  line: "Farah, dum kholne ka time aa gaya kya?" },
        { speakerId: "farah_hyd", line: "Do minute aur. Saffron settle hone de." },
        { speakerId: "zara_hyd",  line: "Haan, warna rice rubbery. Patience!" },
      ],
    },
    {
      id: "queue_check",
      scene: [
        { speakerId: "farah_hyd", line: "Queue kaisi hai aaj, Zara?" },
        { speakerId: "zara_hyd",  line: "Lambi hai bhai — Sunday effect." },
        { speakerId: "farah_hyd", line: "Toh ek extra handi chadha de." },
      ],
    },
    {
      id: "saffron_secret",
      scene: [
        { speakerId: "zara_hyd",  line: "Saffron aaj thoda mehenga tha…" },
        { speakerId: "farah_hyd", line: "Kitna? Sach bata." },
        { speakerId: "zara_hyd",  line: "…tu mat poochh. Biryani mein taste aa jaega." },
      ],
    },
  ],

  hyd_niloufer_cafe: [
    {
      id: "chess_move",
      scene: [
        { speakerId: "naseem_hyd", line: "Asad, queen sacrifice karu kya?" },
        { speakerId: "asad_hyd",   line: "Haula ho gaya hai tu. Mat kar." },
        { speakerId: "naseem_hyd", line: "Brave ya pagal — patla line hai, bhai." },
      ],
    },
    {
      id: "cricket_match",
      scene: [
        { speakerId: "asad_hyd",   line: "Match dekha kya kal raat?" },
        { speakerId: "naseem_hyd", line: "Haan — last over boring tha." },
        { speakerId: "asad_hyd",   line: "Chai peete peete soya mein bhi, bhai." },
      ],
    },
    {
      id: "weather_gossip",
      scene: [
        { speakerId: "asad_hyd",   line: "Aaj baarish lagti hai, Naseem." },
        { speakerId: "naseem_hyd", line: "Hussain Sagar fir overflow karega." },
        { speakerId: "asad_hyd",   line: "Traffic? Mat poochh. Ghar ja abhi." },
      ],
    },
  ],

  // ═══════ DUBAI ════════════════════════════════════════════════════
  dxb_gold_souk: [
    {
      id: "gold_price",
      scene: [
        { speakerId: "khalid_dxb", line: "Layla — aaj ka rate dekha?" },
        { speakerId: "layla_dxb",  line: "Walla, up two dirhams. Busy day." },
        { speakerId: "khalid_dxb", line: "Tourists will haggle harder, then." },
      ],
    },
    {
      id: "hallmark_check",
      scene: [
        { speakerId: "layla_dxb",  line: "Khalid, this piece — check the stamp?" },
        { speakerId: "khalid_dxb", line: "916, clean. Under the clasp, see." },
        { speakerId: "layla_dxb",  line: "Shukran habibi. Confidence ki baat hai." },
      ],
    },
    {
      id: "coffee_offer",
      scene: [
        { speakerId: "layla_dxb",  line: "Gahwa for the gentleman browsing?" },
        { speakerId: "khalid_dxb", line: "Cardamom strong today. Warn them." },
        { speakerId: "layla_dxb",  line: "Warning? That's the point, habibi." },
      ],
    },
  ],

  dxb_desert_majlis: [
    {
      id: "stars_tonight",
      scene: [
        { speakerId: "aisha_dxb", line: "Omar, Al-Suhail rose early tonight." },
        { speakerId: "omar_dxb",  line: "Then winter walks early too." },
        { speakerId: "aisha_dxb", line: "My grandmother would already be packing." },
      ],
    },
    {
      id: "poetry_request",
      scene: [
        { speakerId: "omar_dxb",  line: "Aisha — ek ghazal? The guests are quiet." },
        { speakerId: "aisha_dxb", line: "Tuning the oud first. Give me a minute." },
        { speakerId: "omar_dxb",  line: "Inshallah. Gahwa will wait for you." },
      ],
    },
    {
      id: "patience_lesson",
      scene: [
        { speakerId: "aisha_dxb", line: "Omar, why is this majlis never hurried?" },
        { speakerId: "omar_dxb",  line: "Because hurry in the desert burns water." },
        { speakerId: "aisha_dxb", line: "Everything is patience, khalas." },
      ],
    },
  ],

  // ═══════ BENGALURU ════════════════════════════════════════════════
  blr_mtr: [
    {
      id: "filter_decoction",
      scene: [
        { speakerId: "ravi_blr",  line: "Arjun — decoction thoda weak today saar." },
        { speakerId: "arjun_blr", line: "Same ratio, different beans. Chikmagalur shipped new batch." },
        { speakerId: "ravi_blr",  line: "Adjust maadi, one more spoon powder." },
      ],
    },
    {
      id: "rava_idli_origin",
      scene: [
        { speakerId: "arjun_blr", line: "Every third customer asks about rava idli." },
        { speakerId: "ravi_blr",  line: "War-time invention — worth telling." },
        { speakerId: "arjun_blr", line: "Good story, good breakfast. Free marketing." },
      ],
    },
    {
      id: "tiffin_order",
      scene: [
        { speakerId: "ravi_blr",  line: "Arjun, table seven — dosa or masala dosa?" },
        { speakerId: "arjun_blr", line: "Both — saar ordered full spread." },
        { speakerId: "ravi_blr",  line: "Chutney triple. Karnataka way." },
      ],
    },
  ],

  blr_church_street_pub: [
    {
      id: "gig_tonight",
      scene: [
        { speakerId: "anu_blr",   line: "Divya — setup check at 8?" },
        { speakerId: "divya_blr", line: "8 sharp, maga. Thermal opens." },
        { speakerId: "anu_blr",   line: "Cool. Sound check twice — bass muddled last Friday." },
      ],
    },
    {
      id: "beer_menu",
      scene: [
        { speakerId: "divya_blr", line: "Anu, which IPA's the crowd favourite tonight?" },
        { speakerId: "anu_blr",   line: "Toit's Basmati Blonde. Underrated." },
        { speakerId: "divya_blr", line: "Stocking two extra kegs, then." },
      ],
    },
    {
      id: "traffic_rant",
      scene: [
        { speakerId: "divya_blr", line: "90 minutes from Koramangala today, Anu." },
        { speakerId: "anu_blr",   line: "Metro is the only sanity, maga." },
        { speakerId: "divya_blr", line: "Uber auto or nothing. Not anymore." },
      ],
    },
  ],

  // ═══════ MUMBAI ════════════════════════════════════════════════════
  mum_britannia: [
    {
      id: "berry_stock",
      scene: [
        { speakerId: "priya_mum", line: "Dadi, zereshk shipment aaj pohocha?" },
        { speakerId: "dadi_mum",  line: "Haan dikra, 2 kilos — fresh from Yazd." },
        { speakerId: "priya_mum", line: "Berry pulao back on menu, then." },
      ],
    },
    {
      id: "grandmother_recipe",
      scene: [
        { speakerId: "dadi_mum",  line: "Caramel custard — colour check, dikra." },
        { speakerId: "priya_mum", line: "Mahogany? Or darker?" },
        { speakerId: "dadi_mum",  line: "Mahogany exactly. Don't burn. My mother's rule." },
      ],
    },
    {
      id: "bombay_then",
      scene: [
        { speakerId: "dadi_mum",  line: "Dikra — Ballard Estate in 1970 was all dockworkers." },
        { speakerId: "priya_mum", line: "Haan, great-grandfather's stories." },
        { speakerId: "dadi_mum",  line: "Trams! You could smell the sea here." },
      ],
    },
  ],

  mum_chowpatty_stall: [
    {
      id: "vada_batch",
      scene: [
        { speakerId: "rohan_mum",  line: "Salman! Garam vada pav, ek minute." },
        { speakerId: "salman_mum", line: "Bhai, extra tikha — shooting team ka order." },
        { speakerId: "rohan_mum",  line: "Fatafat. Green chutney heavy." },
      ],
    },
    {
      id: "cricket_chat",
      scene: [
        { speakerId: "salman_mum", line: "Virat ne aaj kya kiya?" },
        { speakerId: "rohan_mum",  line: "Cover drive four. Phir review lost." },
        { speakerId: "salman_mum", line: "Always drama. Bindaas match." },
      ],
    },
    {
      id: "marine_view",
      scene: [
        { speakerId: "rohan_mum",  line: "Queen's necklace aaj bindaas hai bhai." },
        { speakerId: "salman_mum", line: "Monsoon ke baad always best." },
        { speakerId: "rohan_mum",  line: "Chowpatty pe koi bhi jaa sakta hai — sab equal." },
      ],
    },
  ],

  // ═══════ NEW YORK ══════════════════════════════════════════════════
  nyc_katz: [
    {
      id: "pickle_rotation",
      scene: [
        { speakerId: "estelle_nyc", line: "Marcus — full-sours from last month ready." },
        { speakerId: "marcus_nyc",  line: "Six weeks to the day? Send 'em up." },
        { speakerId: "estelle_nyc", line: "Deadass, best batch in months." },
      ],
    },
    {
      id: "pastrami_cut",
      scene: [
        { speakerId: "marcus_nyc",  line: "Estelle, another hand-cut demo for the tourists?" },
        { speakerId: "estelle_nyc", line: "They love it. Tip better after." },
        { speakerId: "marcus_nyc",  line: "Hand cut, pal. Machine's a crime." },
      ],
    },
    {
      id: "lower_east_then",
      scene: [
        { speakerId: "estelle_nyc", line: "Table 13 couple asked about Orchard Street again." },
        { speakerId: "marcus_nyc",  line: "What'd you tell 'em?" },
        { speakerId: "estelle_nyc", line: "Pushcarts, not boutiques. They got it." },
      ],
    },
  ],

  nyc_bodega: [
    {
      id: "morning_rush",
      scene: [
        { speakerId: "sasha_nyc",  line: "Reggie — BEC on a roll, the usual?" },
        { speakerId: "reggie_nyc", line: "Bet. Add black coffee, no cap." },
        { speakerId: "sasha_nyc",  line: "Meatball's on your seat again, fam." },
      ],
    },
    {
      id: "bronx_tape",
      scene: [
        { speakerId: "reggie_nyc", line: "Sasha, found a '82 Bronx mixtape last night." },
        { speakerId: "sasha_nyc",  line: "Yo! Kool Herc era?" },
        { speakerId: "reggie_nyc", line: "Deadass. Playing it at the block party Friday." },
      ],
    },
    {
      id: "rent_talk",
      scene: [
        { speakerId: "sasha_nyc",  line: "Rent went up again, Reggie." },
        { speakerId: "reggie_nyc", line: "Bodegas closing one a month, my guy." },
        { speakerId: "sasha_nyc",  line: "We adapt. Oat milk next to Arizona." },
      ],
    },
  ],

  // ═══════ SINGAPORE ═════════════════════════════════════════════════
  sg_lau_pa_sat: [
    {
      id: "chope_rule",
      scene: [
        { speakerId: "mei_sg",    line: "Priya, tourist moved a tissue packet just now!" },
        { speakerId: "priya_sg",  line: "Aiyoh, you went and said something lah?" },
        { speakerId: "mei_sg",    line: "Of course. Whole stall watched. Shamed." },
      ],
    },
    {
      id: "laksa_vs_chicken",
      scene: [
        { speakerId: "priya_sg",  line: "Mei, which is more popular today — laksa or chicken rice?" },
        { speakerId: "mei_sg",    line: "Chicken rice, same as always lor." },
        { speakerId: "priya_sg",  line: "Laksa got cockles — it's better leh!" },
      ],
    },
    {
      id: "michelin_gossip",
      scene: [
        { speakerId: "mei_sg",    line: "Hill Street soya chicken queue is 2 hours today." },
        { speakerId: "priya_sg",  line: "Michelin curse, aunty. Same kopi, different stress." },
        { speakerId: "mei_sg",    line: "Shiok food, shiok queue. Both real." },
      ],
    },
  ],

  sg_kopitiam: [
    {
      id: "kopi_lesson",
      scene: [
        { speakerId: "uncle_lim_sg", line: "Xiao Ming — kopi-c siu dai peng, can?" },
        { speakerId: "xiao_ming_sg", line: "Evap milk, less sweet, ice. Coming up!" },
        { speakerId: "uncle_lim_sg", line: "Froth thicker. You still learning ah." },
      ],
    },
    {
      id: "kaya_toast",
      scene: [
        { speakerId: "xiao_ming_sg", line: "Uncle, kaya batch today — pandan strong?" },
        { speakerId: "uncle_lim_sg", line: "Very good lah. Charcoal still hot, toast crispy." },
        { speakerId: "xiao_ming_sg", line: "Orders piling up. Breakfast rush starting." },
      ],
    },
    {
      id: "tiong_bahru",
      scene: [
        { speakerId: "uncle_lim_sg", line: "Another hipster bakery opened down the road." },
        { speakerId: "xiao_ming_sg", line: "Aiyah. Bubble tea next to our kopi, lah." },
        { speakerId: "uncle_lim_sg", line: "Uncles still come at 7am. Kopitiam not dying, yet." },
      ],
    },
  ],

  // ═══════ SYDNEY ════════════════════════════════════════════════════
  syd_bondi_chippery: [
    {
      id: "swell_check",
      scene: [
        { speakerId: "maz_syd",  line: "Jack — 4ft at the south end, glassy." },
        { speakerId: "jack_syd", line: "Nice one. I'll close at 11 for a session." },
        { speakerId: "maz_syd",  line: "Chicken salt after. Earned it, mate." },
      ],
    },
    {
      id: "tourist_season",
      scene: [
        { speakerId: "jack_syd", line: "Maz, another lot asking about beginner boards." },
        { speakerId: "maz_syd",  line: "Foamie, 9ft. Let's Go Surfing does lessons." },
        { speakerId: "jack_syd", line: "Ey, good of you to direct them proper." },
      ],
    },
    {
      id: "arvo_ritual",
      scene: [
        { speakerId: "maz_syd",  line: "Sunset surf tonight, Jack?" },
        { speakerId: "jack_syd", line: "Yeah nah — doing stock. Tomorrow?" },
        { speakerId: "maz_syd",  line: "Dawn patrol then. 5:45 am." },
      ],
    },
  ],

  syd_barista_lab: [
    {
      id: "espresso_dial",
      scene: [
        { speakerId: "ari_syd", line: "Nat — shot pulled in 24s, too fast." },
        { speakerId: "nat_syd", line: "Grind finer, half a click." },
        { speakerId: "ari_syd", line: "28 seconds, balanced. Sweet spot." },
      ],
    },
    {
      id: "bean_arrival",
      scene: [
        { speakerId: "nat_syd", line: "Panama Geisha landed this morning, Ari." },
        { speakerId: "ari_syd", line: "Jasmine bomb! Filter flight for the afternoon?" },
        { speakerId: "nat_syd", line: "Four origins side by side. Reckon customers will lose it." },
      ],
    },
    {
      id: "rivalry",
      scene: [
        { speakerId: "ari_syd", line: "Melbourne blog slagged Sydney coffee again." },
        { speakerId: "nat_syd", line: "They can keep the crown. We keep the beach." },
        { speakerId: "ari_syd", line: "Flat white's ours. That's all that matters." },
      ],
    },
  ],
};

/**
 * @param {string} venueId
 * @returns {Array|null} the scene list for that venue, or null.
 */
export const getDialoguesForVenue = (venueId) =>
  AMBIENT_DIALOGUES[venueId] || null;

/**
 * Pick a random scene for a venue. Returns null if none exist.
 * @param {string} venueId
 * @returns {object|null}
 */
export const pickRandomScene = (venueId) => {
  const pool = AMBIENT_DIALOGUES[venueId];
  if (!Array.isArray(pool) || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** @returns {string[]} venue ids that have at least one scene. */
export const listVenuesWithDialogues = () => Object.keys(AMBIENT_DIALOGUES);
