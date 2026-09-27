import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "newyork",
    name: "New York",
    country: "USA",
    countryCode: "US",
    timezone: "America/New_York",
    emoji: "🗽",
    tagline: "The city that never sleeps — bagels at 3 a.m., steam from manholes",
    palette: {
      sky: "#94a3b8",
      ground: "#78716c",
      accent: "#facc15",
    },
    center: {
      lat: 40.7128,
      lon: -74.006,
    },
    greeterId: "marcus_nyc",
    defaultDistrictId: "nyc-midtown",
    emotes: ["wave", "point"],
    facts: [
      {
        text: "The Empire State Building has 6,514 windows and its own ZIP code (10118).",
      },
      {
        text: "A NY slice is eaten folded — this is a municipal tradition, not a suggestion.",
        kind: "flavour",
      },
      {
        text: "Central Park is bigger than the entire country of Monaco.",
      },
    ],
    language: {
      name: "New York English",
      script: "NYC slang",
      greetings: [
        "Yo! How ya doin'?",
        "Hey hey, welcome to the city.",
        "What's up, pal?",
        "Howzit — grab a slice?",
      ],
      filler: ["deadass", "no cap", "bodega", "trynna", "lowkey", "mad", "kid", "wildin'"],
      farewells: ["Catch ya later", "Peace", "See ya, pal", "Take it easy"],
      glossary: {
        deadass: "seriously / I mean it",
        "no cap": "no lie / truly",
        bodega: "corner store",
        trynna: "trying to",
        lowkey: "subtly / kinda",
        mad: "very (intensifier)",
        wildin: "acting wild / outrageous",
      },
      style:
        "New York slang. Use 'deadass', 'no cap', 'bodega', 'trynna', 'lowkey', 'mad good'. Direct, wry, a little fast. No filler pleasantries — get to the point.",
    },
  },
  districts: [
    {
      id: "nyc-midtown",
      name: "Midtown · Times Square",
      blurb: "Broadway, billboards and the crossroads of the world.",
      origin: {
        lat: 40.758,
        lon: -73.9855,
      },
      radiusM: 800,
      spawn: {
        lat: 40.757463,
        lon: -73.985918,
      },
      // Up Broadway / Seventh Avenue into Times Square.
      spawnHeadingDeg: 30,
      geometry: "nyc-midtown",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "nyc_brisket_rye",
      districtId: "nyc-midtown",
      kind: "deli",
      name: "Brisket & Rye",
      emoji: "🥪",
      blurb: "Old-school Jewish deli off Times Square. Pastrami hand-cut, mustard mandatory.",
      likeness: "generic",
      location: {
        lat: 40.7565,
        lon: -73.988,
      },
      placement: "approximate",
      frontage: { location: { lat: 40.756584, lon: -73.987938 }, yawDeg: 209 },
      radiusM: 12,
      hostId: "marcus_nyc",
      menu: ["pastrami-on-rye", "hot-dog"],
      facts: [
        {
          text: "Pastrami came to New York with Romanian Jewish immigrants in the late 1800s.",
        },
        {
          text: "They hand-cut every pastrami. Slicer machines are for chain stores.",
          kind: "flavour",
        },
      ],
      conversation: {
        greeting: "What can I get ya? C'mon, there's a line.",
        seeds: [
          "How is pastrami different from corned beef?",
          "Why hand-cut the pastrami?",
          "What's the story of Lower East Side delis?",
          "Teach me some New York slang",
        ],
        register: "dry-nyc",
        canned: [
          {
            keywords: ["pastrami", "corned", "beef", "different"],
            answer:
              "Corned beef is brined, boiled, sliced. Pastrami is brined, rubbed with pepper and coriander, smoked, steamed, sliced. Pastrami's got the bark, the smoke, the spice. Corned beef's the cousin who shows up late. Deadass, pastrami wins.",
          },
          {
            keywords: ["hand", "cut", "machine", "why", "slicer"],
            answer:
              "Machine slices too thin, the pastrami falls apart. Hand cut means you feel the grain. Every slice is a little different. That's the point. Chain sandwiches are the same. We ain't a chain.",
          },
          {
            keywords: ["lower", "east", "side", "delis", "history", "jewish"],
            answer:
              "Lower East Side was the first stop for Eastern European Jews — 1880s through the 1920s. Delis were pushcart food made indoors. A few old ones still stand downtown — Katz's, Russ & Daughters, Yonah Schimmel. Most delis closed — rent, chains, grandkids don't wanna work here. The survivors matter more because of it.",
          },
          {
            keywords: ["slang", "new", "york", "teach", "nyc"],
            answer:
              "Alright pal — 'deadass' means I'm serious. 'No cap' means no lie. 'Bodega' is the corner store. 'Wilding' is acting crazy. 'Lowkey' means kinda. 'Mad' means very — 'mad good'. Put it together — 'yo this pastrami's mad good, deadass, no cap'. You're a New Yorker now.",
          },
          {
            keywords: ["pickle", "brine", "sour", "half", "kosher"],
            answer:
              "We do half-sour and full-sour. Half's crunchy, bright, two weeks in the brine. Full's deeper, limper, six weeks. Kosher dill — garlic, dill, salt, no vinegar. Don't eat your pastrami without one. The acid cuts the fat. It's the whole point.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2500,
        cityVolumeDuck: 0.3,
        indoor: true,
      },
    },
    {
      id: "nyc_bodega",
      districtId: "nyc-midtown",
      kind: "corner_store",
      name: "Corner Bodega",
      emoji: "🏪",
      blurb: "Open 24/7. Bacon-egg-cheese at 3 a.m. The cat knows you.",
      likeness: "generic",
      location: {
        lat: 40.76,
        lon: -73.987,
      },
      placement: "approximate",
      frontage: { location: { lat: 40.760088, lon: -73.986936 }, yawDeg: 29 },
      radiusM: 8,
      hostId: "sasha_nyc",
      menu: ["bagel", "pretzel", "hot-dog"],
      facts: [
        {
          text: "There are ~10,000 bodegas across NYC — mostly Puerto Rican, Dominican, Yemeni-owned now.",
        },
        {
          text: "The bodega cat is real. Health code technically bans them. Everyone ignores the technicality.",
        },
        {
          text: "A 'bacon, egg, and cheese on a roll, salt, pepper, ketchup' is the NYC breakfast shibboleth.",
        },
      ],
      conversation: {
        greeting: "Yo — the usual? Or you gonna surprise me today?",
        seeds: [
          "What even makes a bodega a bodega?",
          "Why are bodegas so important to NYC?",
          "Tell me about the bodega cat",
          "How do I order like a local?",
        ],
        register: "warm-nyc-bodega",
        canned: [
          {
            keywords: ["what", "bodega", "different", "deli"],
            answer:
              "Bodega's a corner store with a kitchen, my guy. Not a deli — delis are sit-down. Bodega's grab-and-go. Open 24/7, you buy a metrocard, a sandwich, a loose cig, cat food, NyQuil, and a lottery ticket in one visit. The deli's fancy. The bodega is necessary.",
          },
          {
            keywords: ["important", "nyc", "culture", "why", "community"],
            answer:
              "In NYC you can live in a five-story walkup with no elevator, no air conditioning, and no stove. Bodega's your kitchen. Your safe deposit. The guy behind the counter lets you pay tomorrow. He knows your mom's visiting. Bodegas are the nervous system of the neighborhood.",
          },
          {
            keywords: ["cat", "bodega", "animal", "why"],
            answer:
              "Every bodega's got a cat, kid. Pest control, sure, but mostly company. My cat's named Meatball. Customers bring him treats. Health inspector pretends he doesn't see him. Meatball doesn't work for the health inspector.",
          },
          {
            keywords: ["order", "local", "how", "sandwich", "breakfast"],
            answer:
              "Order like this: 'Bacon egg and cheese on a roll, salt pepper ketchup.' Say it fast, one breath. Don't say 'please' — sounds like a tourist. Say 'lemme get' — you're in. Add 'no cap, make it nice' for flourish. You'll get extra bacon.",
          },
          {
            keywords: ["24", "7", "open", "hours", "night"],
            answer:
              "We're open always, fam. Except maybe Christmas morning for three hours. Night shift is wild — people coming home from bars, people starting their day at 4 a.m., cops, nurses, everyone. Night bodega is the most honest New York.",
          },
          {
            keywords: ["gentrification", "changing", "neighborhood", "rent"],
            answer:
              "Rent goes up, my guy. Old bodegas close, artisanal coffee shops open. We lost 15% of bodegas in the last decade. But the ones surviving — they adapted. Kombucha next to the Arizona iced tea. Oat milk for the bacon-egg-cheese. Real New York adapts, deadass.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2000,
        cityVolumeDuck: 0.35,
        indoor: true,
      },
    },
    {
      id: "nyc_times_square",
      districtId: "nyc-midtown",
      kind: "landmark",
      name: "Times Square",
      emoji: "🗽",
      blurb: "An LED-drenched crossroads at the center of the capitalist imagination.",
      likeness: "public-landmark",
      location: {
        lat: 40.758,
        lon: -73.9855,
      },
      placement: "real",
      radiusM: 12,
      menu: [],
      facts: [
        {
          text: "330,000 pedestrians pass through daily — one of the planet's busiest intersections.",
        },
        {
          text: "Originally 'Longacre Square'; renamed in 1904 when the NY Times moved in.",
        },
        {
          text: "The New Year's ball has dropped since 1907. Currently LED-lit Waterford crystal.",
        },
      ],
      ambience: {
        crossfadeMs: 2500,
        cityVolumeDuck: 0.3,
        indoor: false,
      },
    },
  ],
  residents: [
    {
      id: "marcus_nyc",
      name: "Marcus",
      homePlaceId: "nyc_brisket_rye",
      role: "host",
      bio: "Counter guy at Brisket & Rye. Dry humour.",
      persona:
        "You are the counter guy at an old-school Jewish deli in Midtown. Direct, dry, fast. Drops 'pal', 'buddy'. No pleasantries — get to the order. Affection hides under the attitude.",
      expertise: ["pastrami", "nyc-delis", "nyc-slang", "jazz-nyc"],
      routine: "host",
      lines: [
        "What can I get ya? C'mon, there's a line.",
        "Pastrami on rye, mustard — you got it.",
        "Half-sour or full-sour? Pick one, pal.",
      ],
      canned: [],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "adult",
        attire: "white counterman's shirt and apron",
      },
    },
    {
      id: "sasha_nyc",
      name: "Sasha",
      homePlaceId: "nyc_bodega",
      role: "host",
      bio: "Bodega owner. Knows every regular.",
      persona:
        "You are the bodega owner who knows every regular by their order. Warm, fast, slightly sardonic. Quick friendly roasts. Drops 'my guy', 'fam', 'kid'. NYC slang. Answers anything about the neighborhood.",
      expertise: ["bodega-culture", "bagel-culture", "nyc-slang", "story-telling"],
      routine: "market",
      lines: [
        "Yo, the usual? Bacon-egg-cheese?",
        "Meatball's napping on the chip aisle again.",
        "Deadass, we got everything.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "adult",
        attire: "zip hoodie, lanyard of store keys",
      },
    },
    {
      id: "estelle_nyc",
      name: "Estelle",
      homePlaceId: "nyc_brisket_rye",
      role: "regular",
      bio: "Pickle queen of the Lower East Side. Third-gen deli regular.",
      expertise: ["pickling", "nyc-delis", "lower-east-side", "story-telling"],
      routine: "chat_stall",
      lines: [
        "Two weeks for half-sour, six for full. Don't rush it.",
        "My grandmother's recipe — dill, garlic, salt. No vinegar.",
        "Orchard Street before the condos — that was a street.",
      ],
      canned: [
        {
          keywords: ["pickle", "brine", "ferment", "sour"],
          answer:
            "Half-sour: two weeks, still crunchy, bright. Full-sour: six weeks, soft, deep. Kosher dill: garlic, dill, salt, water, no vinegar. Vinegar pickles are a crime against the Lower East Side. Fermentation is the whole point.",
        },
        {
          keywords: ["deli", "jewish", "history", "lower", "east"],
          answer:
            "Lower East Side had three hundred kosher delis at the peak, kid. The ones that survived never modernized. Smoked fish and pastrami don't need updating. Most closed — rent, grandkids, real estate. The ones left? Museums you can eat in.",
        },
        {
          keywords: ["orchard", "street", "old", "neighborhood"],
          answer:
            "Orchard Street was pushcarts, not boutiques. Yiddish on every corner. You'd buy eggs from one guy, fabric from another, pickle from my grandfather. Now — a thousand-dollar handbag on the same sidewalk. Same bricks, different city.",
        },
      ],
      look: {
        avatarId: "body-f-senior",
        presentation: "feminine",
        ageBand: "senior",
        attire: "wool coat, big glasses, canvas tote",
      },
    },
    {
      id: "reggie_nyc",
      name: "DJ Reggie",
      homePlaceId: "nyc_bodega",
      role: "regular",
      bio: "Bodega regular, hip-hop DJ, corner-historian.",
      expertise: ["hip-hop", "bodega-culture", "nyc-slang", "jazz-nyc"],
      routine: "market",
      lines: [
        "Yo — Bronx cassette mixtape, 1982, deadass.",
        "Bodega's the third place, my guy. Home, work, here.",
        "New York slang changes every five years. Keep up.",
      ],
      canned: [
        {
          keywords: ["hip-hop", "hip", "hop", "rap", "music"],
          answer:
            "Hip-hop started in the Bronx, 1973. Kool Herc's party at 1520 Sedgwick — breakbeats looped for the dancers. Grandmaster Flash, Afrika Bambaataa followed. New York birthed a whole genre in a rec room, my guy.",
        },
        {
          keywords: ["bodega", "corner", "community", "role"],
          answer:
            "Bodega's the third place, fam. Home, work, here. The owner knows your coffee order, your mom's name, and that you pay on Thursday. You can't get that at a Duane Reade. Third places build neighborhoods.",
        },
        {
          keywords: ["slang", "new", "york", "words"],
          answer:
            "Deadass, no cap, bet, lowkey, mad, wildin'. Each decade adds five, drops five. '90s was 'word', 2000s was 'mad', 2010s was 'lit', now it's 'deadass'. Stay on your game or sound like a dad.",
        },
      ],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "adult",
        attire: "fitted cap, hoodie, headphones around the neck",
      },
    },
  ],
  foods: [
    {
      id: "ny-slice",
      name: "NY Slice",
      emoji: "🍕",
      price: 12,
      description: "Thin-crust, foldable, eaten walking.",
    },
    {
      id: "pretzel",
      name: "Soft Pretzel",
      emoji: "🥨",
      price: 6,
      description: "Salt-flecked knot, yellow mustard on the side.",
    },
    {
      id: "bagel",
      name: "Bagel with Cream Cheese",
      emoji: "🥯",
      price: 8,
      description: "Boiled-then-baked, the New York water makes it.",
    },
    {
      id: "hot-dog",
      name: "Hot Dog",
      emoji: "🌭",
      price: 7,
      description: "Steamed dog in a bun, mustard + sauerkraut optional.",
    },
    {
      id: "pastrami-on-rye",
      name: "Pastrami on Rye",
      emoji: "🥪",
      price: 22,
      description:
        "Hand-cut, peppery smoked brisket piled on rye with mustard. A pickle on the side.",
    },
  ],
  events: [
    {
      id: "nyc_pickle_thursday",
      placeId: "nyc_brisket_rye",
      title: "Thursday Pickle Rotation",
      blurb: "Estelle rolls out the new full-sour batch. Free taste with any pastrami plate.",
      emoji: "🥒",
      schedule: {
        dayOfWeek: 4,
        startHour: 17,
        durationHours: 4,
      },
    },
    {
      id: "nyc_block_party",
      placeId: "nyc_bodega",
      title: "Friday Block-Party Mixtape",
      blurb:
        "DJ Reggie spins from the Arizona iced-tea cooler. Sasha hands out free bagels at midnight.",
      emoji: "🎤",
      schedule: {
        dayOfWeek: 5,
        startHour: 21,
        durationHours: 4,
      },
    },
  ],
});
