/**
 * Monument catalog — Phase 10E.
 *
 * Maps each landmark `type` (from cityCatalog.landmarks[]) to a real
 * photo + factual blurb + builtYear + opening hours + Wikimedia
 * attribution string. The data lives in code so we can ship without
 * a CMS; photos live as static files under client/public/images/monuments/
 * matching `{photoUrl}`.
 *
 * License posture: every photoUrl entry must carry a `attribution`
 * string with author + license. Wikimedia Commons CC-BY-SA 4.0 is
 * acceptable; track in client/public/images/monuments/ATTRIBUTION.md
 * for the public credit list (copy on every update).
 *
 * Missing photos degrade gracefully — the client's <MonumentBillboard>
 * uses a texture loader with onError that hides the plane on 404 so
 * the primitive landmark silhouette continues to render alone.
 */

export const MONUMENTS = {
  // ═══ Hyderabad ═════════════════════════════════════════════════════
  charminar: {
    photoUrl: "/images/monuments/charminar.jpg",
    builtYear: 1591,
    blurb: "Built by Sultan Quli Qutb Shah to mark the end of a deadly plague. Four 56-metre minarets, the sound of azaan still carries to Laad Bazaar.",
    openingHours: "9:00 — 17:30 daily",
    attribution: "Wikimedia Commons / Bernard Gagnon · CC BY-SA 3.0",
  },
  golcondaArch: {
    photoUrl: "/images/monuments/golconda.jpg",
    builtYear: 1518,
    blurb: "The Golconda Fort's arch — a clap at the entrance echoes a kilometre away to the summit. Once the Kohinoor diamond passed through here.",
    openingHours: "9:00 — 17:30 daily",
    attribution: "Wikimedia Commons / Vinay Madapu · CC BY-SA 4.0",
  },
  hitecTower: {
    photoUrl: "/images/monuments/hitec.jpg",
    builtYear: 1998,
    blurb: "The lighthouse of Hyderabad's IT renaissance. Microsoft, Google, Amazon — the Telugu engineering diaspora's home base.",
    openingHours: "Office hours",
    attribution: "Wikimedia Commons / Sridhardo · CC BY-SA 3.0",
  },

  // ═══ Dubai ═════════════════════════════════════════════════════════
  burjKhalifa: {
    photoUrl: "/images/monuments/burj_khalifa.jpg",
    builtYear: 2010,
    blurb: "828 metres. The world's tallest building since 2010. Sunset on the 148th floor is the most-photographed view in the Gulf.",
    openingHours: "08:30 — 23:00 daily",
    attribution: "Wikimedia Commons / Donaldytong · CC BY-SA 3.0",
  },
  burjAlArab: {
    photoUrl: "/images/monuments/burj_al_arab.jpg",
    builtYear: 1999,
    blurb: "A sail rising from a private island. The world's first 7-star hotel, designed by Tom Wright — only guests pass the gate.",
    openingHours: "Hotel access only",
    attribution: "Wikimedia Commons / Joi Ito · CC BY 2.0",
  },
  goldSouk: {
    photoUrl: "/images/monuments/gold_souk.jpg",
    builtYear: 1940,
    blurb: "300+ shops in Deira hold ten tonnes of gold on display at any moment. Bargaining is expected — start at 40% off.",
    openingHours: "10:00 — 22:00, closed Friday morning",
    attribution: "Wikimedia Commons / Ahmed S Bel · CC BY-SA 4.0",
  },

  // ═══ Bengaluru ═════════════════════════════════════════════════════
  vidhanaSoudha: {
    photoUrl: "/images/monuments/vidhana_soudha.jpg",
    builtYear: 1956,
    blurb: "Karnataka's legislative seat in granite Neo-Dravidian style. The dome echoes the Mysore Palace — civic temple of the state.",
    openingHours: "Public on Sundays only",
    attribution: "Wikimedia Commons / Muhammad Mahdi Karim · GFDL 1.2",
  },
  cubbonPark: {
    photoUrl: "/images/monuments/cubbon_park.jpg",
    builtYear: 1870,
    blurb: "300 acres of gulmohar, bamboo, and eucalyptus right in the middle of the city. Sunday is for cyclists — main road closes.",
    openingHours: "Open 24h; main road closed Sun 5–10 AM",
    attribution: "Wikimedia Commons / Ramesh NG · CC BY-SA 2.0",
  },
  techPark: {
    photoUrl: "/images/monuments/tech_park.jpg",
    builtYear: 1999,
    blurb: "Manyata, Bagmane, Embassy Tech Village — 1.5 million IT workers commute through these gates daily. The exports build the city.",
    openingHours: "24h",
    attribution: "Wikimedia Commons / Sarvabodha · CC BY-SA 4.0",
  },

  // ═══ Mumbai ════════════════════════════════════════════════════════
  gatewayOfIndia: {
    photoUrl: "/images/monuments/gateway_of_india.jpg",
    builtYear: 1924,
    blurb: "Indo-Saracenic arch built for King George V's 1911 visit. The British Empire's last Indian troops embarked from these steps in 1948.",
    openingHours: "24h, free entry",
    attribution: "Wikimedia Commons / A.Savin · CC BY-SA 3.0",
  },
  marineDrive: {
    photoUrl: "/images/monuments/marine_drive.jpg",
    builtYear: 1920,
    blurb: "3.6 km curve along the Arabian Sea. The amber street-lamps at night earned the nickname 'Queen's Necklace'. Joggers, lovers, bhel.",
    openingHours: "24h",
    attribution: "Wikimedia Commons / Christopher John SSF · CC BY-SA 2.0",
  },
  localTrain: {
    photoUrl: "/images/monuments/mumbai_local.jpg",
    builtYear: 1853,
    blurb: "Asia's first railway line ran 33 km from Bori Bunder to Thane. Today the network carries 7.5 million passengers daily.",
    openingHours: "04:00 — 01:00",
    attribution: "Wikimedia Commons / Bombman · CC BY-SA 4.0",
  },

  // ═══ New York ══════════════════════════════════════════════════════
  timesSquare: {
    photoUrl: "/images/monuments/times_square.jpg",
    builtYear: 1904,
    blurb: "330,000 pedestrians a day. Originally Longacre Square; renamed when the New York Times moved in. The ball-drop has run since 1907.",
    openingHours: "24h",
    attribution: "Wikimedia Commons / Anthony Quintano · CC BY 2.0",
  },
  empireState: {
    photoUrl: "/images/monuments/empire_state.jpg",
    builtYear: 1931,
    blurb: "381 metres of Art Deco built in 410 days during the Depression. The 86th-floor observation deck has hosted 110 million visitors.",
    openingHours: "10:00 — 24:00",
    attribution: "Wikimedia Commons / Sam Valadi · CC BY 2.0",
  },
  brooklynBridge: {
    photoUrl: "/images/monuments/brooklyn_bridge.jpg",
    builtYear: 1883,
    blurb: "The world's first steel-wire suspension bridge. John Roebling died from injuries surveying it; his son finished the work from a wheelchair.",
    openingHours: "24h",
    attribution: "Wikimedia Commons / Postdlf · CC BY-SA 3.0",
  },

  // ═══ Singapore ═════════════════════════════════════════════════════
  marinaBaySands: {
    photoUrl: "/images/monuments/marina_bay_sands.jpg",
    builtYear: 2010,
    blurb: "Three towers united by a 340-metre SkyPark with the world's largest cantilevered platform. Designed by Moshe Safdie, $5.5 billion to build.",
    openingHours: "Casino + observation deck 09:30 — 22:00",
    attribution: "Wikimedia Commons / Erwin Soo · CC BY 2.0",
  },
  supertrees: {
    photoUrl: "/images/monuments/supertrees.jpg",
    builtYear: 2012,
    blurb: "18 vertical gardens, 25–50 metres tall, in Gardens by the Bay. Some are solar; all are climbed by 162 species of plants. Free light show nightly.",
    openingHours: "05:00 — 02:00, light show 19:45 + 20:45",
    attribution: "Wikimedia Commons / William Cho · CC BY-SA 2.0",
  },
  merlion: {
    photoUrl: "/images/monuments/merlion.jpg",
    builtYear: 1972,
    blurb: "Lion's head, fish's body. Designed by Fraser Brunner in 1964 as the Singapore Tourism Board's logo. The 8.6-metre statue spouts the harbour.",
    openingHours: "24h",
    attribution: "Wikimedia Commons / Calvin Teo · CC BY-SA 3.0",
  },

  // ═══ Sydney ════════════════════════════════════════════════════════
  operaHouse: {
    photoUrl: "/images/monuments/opera_house.jpg",
    builtYear: 1973,
    blurb: "Jørn Utzon's competition-winning design with 1,056,006 individually-cut roof tiles. UNESCO World Heritage since 2007.",
    openingHours: "Tours 09:00 — 17:00",
    attribution: "Wikimedia Commons / Adam.J.W.C. · CC BY-SA 3.0",
  },
  harbourBridge: {
    photoUrl: "/images/monuments/harbour_bridge.jpg",
    builtYear: 1932,
    blurb: "503-metre steel arch carrying 8 lanes, 2 rail tracks, a footway, and a cycle path. Climbing the arch is the harbour's most-Instagrammed activity.",
    openingHours: "Climbs 07:00 — 18:30 daily",
    attribution: "Wikimedia Commons / Hpeterswald · CC BY-SA 3.0",
  },
};

export const listMonumentTypes = () => Object.keys(MONUMENTS);
export const getMonument = (type) => MONUMENTS[type] || null;
export const allMonumentsPublic = () => MONUMENTS;
