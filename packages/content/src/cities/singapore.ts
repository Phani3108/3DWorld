import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
    emoji: "🌆",
    tagline: "Garden in a city — hawker stalls, supertrees, rain at 4 p.m.",
    palette: {
      sky: "#a5f3fc",
      ground: "#e7e5e4",
      accent: "#ec4899",
    },
    center: {
      lat: 1.3521,
      lon: 103.8198,
    },
    greeterId: "mei_sg",
    defaultDistrictId: "sg-marina-bay",
    emotes: ["bow", "nod"],
    facts: [
      {
        text: "Singapore has more than 100 hawker centres, and in 2016 two hawker stalls became the first street-food stalls to win Michelin stars.",
        status: "corrected",
        note: "Legacy text said ~50 centres, and that centres (not stalls) held stars.",
      },
      {
        text: "The Supertrees collect rainwater and generate solar power for Gardens by the Bay.",
      },
      {
        text: "Selling chewing gum has been banned since 1992 (chewing it isn't a crime), and feeding wild monkeys can earn you a fine.",
        status: "corrected",
        note: "Legacy text said chewing gum is illegal.",
      },
    ],
    language: {
      name: "Singlish",
      script: "Singlish",
      greetings: [
        "Hello hello!",
        "Eh, you come already ah?",
        "Aiyoh, welcome lah.",
        "Wah shiok weather today hor?",
      ],
      filler: ["lah", "leh", "lor", "hor", "sia", "aiyoh", "shiok", "chope", "can can"],
      farewells: ["Bye lah", "See you ah", "Take care lor"],
      glossary: {
        lah: "emphasis particle",
        leh: "soft emphasis / questioning",
        lor: "acceptance / resignation",
        hor: "agreement tag",
        aiyoh: "oh no / oh dear",
        shiok: "extremely satisfying",
        chope: "to reserve / save a seat",
      },
      style:
        "Singlish. End sentences with 'lah', 'leh', 'lor' appropriately. Use 'shiok' for good things, 'aiyoh' for surprise, 'can can' for 'sure'. Polite, playful, efficient.",
    },
  },
  districts: [
    {
      id: "sg-marina-bay",
      name: "Marina Bay",
      blurb: "Lau Pa Sat's cast iron, the CBD, and Gardens by the Bay across the water.",
      // Centred on the bay so Lau Pa Sat and Gardens by the Bay both fall inside.
      origin: {
        lat: 1.2815,
        lon: 103.8565,
      },
      radiusM: 1000,
      spawn: {
        lat: 1.28113,
        lon: 103.851303,
      },
      spawnHeadingDeg: 33,
      geometry: "sg-marina-bay",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "sg_lau_pa_sat",
      districtId: "sg-marina-bay",
      kind: "hawker_centre",
      name: "Lau Pa Sat",
      emoji: "🍜",
      blurb: "Victorian-era hawker centre. Satay Street fires up at 7 p.m.",
      likeness: "public-landmark",
      location: {
        lat: 1.2806,
        lon: 103.8504,
      },
      placement: "approximate",
      frontage: { location: { lat: 1.280754, lon: 103.850169 }, yawDeg: 304 },
      radiusM: 12,
      hostId: "mei_sg",
      menu: ["chicken-rice", "laksa", "kaya-toast"],
      facts: [
        {
          text: "Lau Pa Sat means 'old market' in Hokkien; its cast-iron structure dates from 1894.",
        },
        {
          text: "Michelin's Bib Gourmand list (good food at a good price — not a star) regularly features Singapore hawker stalls.",
          status: "corrected",
          note: "Legacy text claimed two stalls here hold 'Bib Gourmand stars'. Bib Gourmand is not a star; the stalls are unverified.",
        },
        {
          text: "The practice of 'chope-ing' a table with a tissue packet is unwritten law.",
        },
      ],
      conversation: {
        greeting: "Eh, what you want? Chicken rice hot hot, queue move leh.",
        seeds: [
          "How do I order kopi like a Singaporean?",
          "What's Hainanese chicken rice, properly?",
          "What's the chope culture about?",
          "What is Singlish?",
        ],
        register: "singlish-hawker",
        canned: [
          {
            keywords: ["kopi", "order", "code", "how", "coffee"],
            answer:
              "Listen ah. Plain 'kopi' — with condensed milk, sweet. 'Kopi-o' — black with sugar. 'Kopi-o kosong' — black no sugar. 'Kopi-c' — with evaporated milk, can add sugar. 'Kopi peng' — iced. 'Siu dai' — less sweet. 'Gao' — extra strong. String them: 'kopi-c siu dai peng' — iced with evap, less sweet. Shiok.",
          },
          {
            keywords: ["chicken", "rice", "hainanese", "proper", "what"],
            answer:
              "Hainanese chicken rice, lah. Chicken poached in seasoned water, rice cooked in the chicken broth — that's why fragrant. Chili sauce garlic ginger, dark soy, sliced cucumber on side. Ice bath the chicken skin for bounce. Sounds simple but every aunty got secret. Anyone say their version best — lying.",
          },
          {
            keywords: ["chope", "tissue", "reserve", "table", "culture"],
            answer:
              "Chope means claim, lah. You put tissue packet on the seat. That seat is yours. Other Singaporean see tissue — walk away. No Singaporean moves tissue. It's trust. Works because everyone agrees. Break the rule once — whole country judges you.",
          },
          {
            keywords: ["singlish", "what", "language", "speak"],
            answer:
              "Singlish is Singapore English — mixed with Malay, Hokkien, Tamil, Cantonese. Particles at end — 'lah', 'leh', 'lor', 'hor'. Not broken English lah — it's our own language. Government wants us to speak 'proper' English. We understand both but Singlish at the hawker, English at the office. Two-channel brain.",
          },
          {
            keywords: ["laksa", "what", "soup", "dish"],
            answer:
              "Laksa is coconut curry noodle, lah. Katong style got fish cake, prawns, cockles. Rice noodles. Orange-red soup that stains your shirt. Eat with tao gay and lime. Best at the eaten-in-fifteen-minutes hawker, not a fancy restaurant. Real laksa got a soup that you want to drink alone.",
          },
          {
            keywords: ["michelin", "star", "hawker", "cheap", "food"],
            answer:
              "Yes lah, Singapore got hawker stalls with Michelin stars. Hill Street soya chicken rice, under $5. Was world's cheapest Michelin meal. Point is — good food is not about fancy chairs. Aunty cooking same dish for forty years — that's what Michelin finally admitted. Shiok.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2000,
        cityVolumeDuck: 0.35,
        indoor: false,
      },
    },
    {
      id: "sg_kopitiam",
      districtId: "sg-marina-bay",
      kind: "kopitiam",
      name: "Old Kopitiam",
      emoji: "🍞",
      blurb: "Morning kaya toast, perfectly soft-boiled eggs, retired uncles reading the paper.",
      likeness: "generic",
      location: {
        lat: 1.2825,
        lon: 103.8525,
      },
      placement: "approximate",
      frontage: { location: { lat: 1.282554, lon: 103.852491 }, yawDeg: 212 },
      radiusM: 8,
      hostId: "uncle_lim_sg",
      menu: ["kopi", "kaya-toast"],
      facts: [
        {
          text: "A proper kopitiam toast is grilled over charcoal — not a toaster.",
        },
        {
          text: "Kaya is pandan-coconut jam; colour comes from pandan leaves, not dye.",
        },
        {
          text: "Tiong Bahru is Singapore's oldest housing estate — 1930s Art Deco walk-ups.",
        },
      ],
      conversation: {
        greeting: "Kopi hor? Tell me how you like it.",
        seeds: [
          "Why is Tiong Bahru special?",
          "How do you make real kaya toast?",
          "What is a kopitiam, exactly?",
          "What's the future of Singapore's old kopitiams?",
        ],
        register: "uncle-singlish",
        canned: [
          {
            keywords: ["tiong", "bahru", "special", "estate", "old"],
            answer:
              "Tiong Bahru means 'new cemetery' — but that's ironic, it's our oldest estate. 1930s Art Deco walk-ups. Built when Singapore still British. Low-rise, curved balconies, communal courtyards. Now hipsters moved in — bakeries, bookshops. Old aunties and bubble tea, same street. Works somehow.",
          },
          {
            keywords: ["kaya", "toast", "real", "make", "recipe"],
            answer:
              "Pandan leaves simmered with coconut milk, eggs, sugar — low low heat, two hours, whisked constantly till jam. That's kaya. Real toast — Sultana bread, sliced thin, charcoal grill, butter thick thick, kaya spread, close sandwich. Pair with soft-boiled egg and kopi-c. Proper breakfast lah.",
          },
          {
            keywords: ["kopitiam", "what", "exactly", "mean"],
            answer:
              "Kopi means coffee, tiam means shop in Hokkien. Kopitiam is a coffee shop — but more. Multiple stalls under one roof, each selling different food, sharing tables. Breakfast chicken rice nasi lemak dim sum kopi all together. It's where old Singapore still eats. Kopitiam culture is the real heritage.",
          },
          {
            keywords: ["future", "gentrification", "losing", "closing", "rent"],
            answer:
              "Aiyoh, hard question. Rent going up, children don't want to take over. Big chains buying the spaces. Government trying to preserve heritage stalls. We'll see lah. Some will close. Some will adapt. As long as the uncles still come at 7 a.m. for kopi and paper, kopitiam hasn't died.",
          },
          {
            keywords: ["egg", "soft", "boil", "proper", "how"],
            answer:
              "Soft-boiled egg hot water method — pour boiling water over eggs in a jug, cover, wait eight minutes. Crack into saucer. Should be liquid white, runny yolk. Soy sauce, white pepper, dip the toast. If yolk set solid — we failed. Eight minutes, can.",
          },
          {
            keywords: ["uncle", "auntie", "term", "call", "respect"],
            answer:
              "We call older men 'uncle', older women 'auntie'. Not family — respect. Hawker aunty, taxi uncle, MRT station auntie. No last name needed. It's Singapore's way of saying — you matter, even though we don't know you. Soft hierarchy. Everyone fits.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2000,
        cityVolumeDuck: 0.4,
        indoor: false,
      },
    },
    {
      id: "sg_gardens_by_the_bay",
      districtId: "sg-marina-bay",
      kind: "park",
      name: "Gardens by the Bay",
      emoji: "🌿",
      blurb: "Supertrees + domed conservatories. Engineering that pretends to be a jungle.",
      likeness: "public-landmark",
      location: {
        lat: 1.2816,
        lon: 103.8636,
      },
      placement: "approximate",
      radiusM: 12,
      menu: [],
      facts: [
        {
          text: "18 Supertrees, each 25-50 m tall; some are solar, all support vertical gardens.",
        },
        {
          text: "The Cloud Forest's 35 m indoor waterfall was the world's tallest when it opened; Jewel Changi's 40 m Rain Vortex now beats it.",
          status: "corrected",
          note: "Legacy text still called it the tallest.",
        },
        {
          text: "Gardens by the Bay opened in 2012 on reclaimed land at Marina Bay.",
          status: "corrected",
          note: "Dropped unsourced cost-per-visit and profitability claims.",
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
      id: "mei_sg",
      name: "Mei",
      homePlaceId: "sg_lau_pa_sat",
      role: "host",
      bio: "Hawker aunty. Efficient.",
      persona:
        "You are a hawker aunty. Singlish, efficient, slightly grumpy but fair. 'One chicken rice lah? Chili on side lor.' 'Eh, don't stand there, queue move.' Warm underneath. Teach the kopi code if asked.",
      expertise: ["hawker-food", "chicken-rice", "laksa", "singlish", "chope-culture"],
      routine: "hawker",
      lines: [
        "Eh, chicken rice one lah? Chili separate lor.",
        "Wah shiok today, queue short.",
        "Chope the table first, then order.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "middle-aged",
        attire: "hawker apron over a T-shirt, hair in a bun",
      },
    },
    {
      id: "uncle_lim_sg",
      name: "Uncle Lim",
      homePlaceId: "sg_kopitiam",
      role: "host",
      bio: "Kopitiam regular. Teaches kopi codes.",
      persona:
        "You are an uncle behind the counter of an old kopitiam. Polite, patient, Singlish. Teaches the kopi codes. Enjoys regulars, grumbles about gentrification kindly.",
      expertise: ["kopi-codes", "kaya-toast", "kopitiam", "singlish"],
      routine: "chat_stall",
      lines: [
        "Kopi hor? Tell me how you like.",
        "Kaya toast crispy today, best one.",
        "Tiong Bahru morning best time ah.",
      ],
      canned: [],
      look: {
        avatarId: "body-m-senior",
        presentation: "masculine",
        ageBand: "senior",
        attire: "white singlet, shorts, sandals",
      },
    },
    {
      id: "xiao_ming_sg",
      name: "Xiao Ming",
      homePlaceId: "sg_kopitiam",
      role: "regular",
      bio: "Kopi trainee learning from Uncle Lim. Speaks Hokkien at home.",
      expertise: ["kopi-codes", "hokkien", "singlish", "kopitiam"],
      routine: "barista",
      lines: [
        "Uncle Lim say my froth still not thick enough.",
        "Hokkien ah — 'chim' means deep, like the kopi.",
        "Kopi-c siu dai peng — one! Coming up lah.",
      ],
      canned: [
        {
          keywords: ["kopi", "code", "order", "how"],
          answer:
            "Lah, slow slow. Kopi = condensed milk + coffee. Kopi-o = black sugar. Kopi-c = evap milk + sugar. 'Siu dai' = less sweet. 'Gao' = stronger. 'Peng' = ice. Uncle Lim tested me — kopi-c siu dai peng I can do sleeping.",
        },
        {
          keywords: ["hokkien", "dialect", "word"],
          answer:
            "Hokkien got tones ah — 'chim' with one tone means deep, different tone means visit. 'Bojio' means 'you didn't invite me', used with drama. Aunties use Hokkien, kids don't learn. Dying language, sadly.",
        },
        {
          keywords: ["uncle", "auntie", "call", "respect"],
          answer:
            "Everyone older is uncle or auntie, not relatives. Taxi uncle, hawker auntie, cleaning auntie. Shows respect without knowing name. My grandmother is 'Ah Ma' — grandma in Hokkien. Soft hierarchy, Singapore style.",
        },
      ],
      look: {
        avatarId: "body-m-young",
        presentation: "masculine",
        ageBand: "young-adult",
        attire: "polo shirt and kopitiam apron",
      },
    },
    {
      id: "priya_sg",
      name: "Priya (Aunty)",
      homePlaceId: "sg_lau_pa_sat",
      role: "regular",
      bio: "Indian hawker aunty at Lau Pa Sat. Runs the laksa & roti stall.",
      expertise: ["laksa", "chicken-rice", "chope-culture", "singlish"],
      routine: "hawker",
      lines: [
        "Eh my laksa better than the stall over there lor.",
        "Chope the table first, order later. Don't skip.",
        "Roti prata? Two plain one egg, can.",
      ],
      canned: [
        {
          keywords: ["laksa", "recipe", "broth", "coconut"],
          answer:
            "Katong laksa is the real one lah — coconut curry, shrimp paste, lemongrass, galangal, dried chilli. Short rice noodles so you slurp with a spoon. Cockles, fish cake, prawn. Spicy, creamy, one bowl is the whole day.",
        },
        {
          keywords: ["chicken", "rice", "hainanese", "proper"],
          answer:
            "Chicken poached gently, ice-bath the skin for bounce. Rice cooked in the chicken broth with pandan and ginger. Chili-ginger sauce on the side. Aunty like me — forty years same recipe, not changing.",
        },
        {
          keywords: ["chope", "table", "reserve", "tissue"],
          answer:
            "Chope with tissue packet, lah. Nobody touches it. Sacred rule. You see tissue, you walk. Break the rule, the whole hawker centre judges. I've seen aunties chase tourists with ladles. Respect chope culture.",
        },
      ],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "middle-aged",
        attire: "cotton kurta with an apron",
      },
    },
  ],
  foods: [
    {
      id: "chicken-rice",
      name: "Hainanese Chicken Rice",
      emoji: "🍚",
      price: 18,
      description: "Poached chicken, fragrant rice, chili-ginger condiment trio.",
    },
    {
      id: "laksa",
      name: "Laksa",
      emoji: "🍜",
      price: 15,
      description: "Coconut noodle soup with prawns and tofu puffs.",
    },
    {
      id: "kaya-toast",
      name: "Kaya Toast",
      emoji: "🍞",
      price: 8,
      description: "Charcoal-grilled toast with pandan-coconut jam and a slab of cold butter.",
    },
    {
      id: "kopi",
      name: "Kopi",
      emoji: "☕",
      price: 5,
      description: "Kopitiam-style coffee with condensed milk.",
    },
  ],
  events: [
    {
      id: "sg_kopi_dawn",
      placeId: "sg_kopitiam",
      title: "Sunday Kopi Dawn Patrol",
      blurb: "Uncle Lim grinds fresh. Xiao Ming's microfoam is finally consistent.",
      emoji: "☕",
      schedule: {
        dayOfWeek: 0,
        startHour: 6,
        durationHours: 3,
      },
    },
    {
      id: "sg_hawker_lunch",
      placeId: "sg_lau_pa_sat",
      title: "Hawker-Centre Lunch Rush",
      blurb: "Mei and Priya open all six woks. Chope responsibly.",
      emoji: "🍜",
      schedule: {
        dayOfWeek: 6,
        startHour: 12,
        durationHours: 3,
      },
    },
  ],
});
