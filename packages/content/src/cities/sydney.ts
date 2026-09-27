import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
    emoji: "🏄",
    tagline: "Harbour and sails — flat whites, Bondi swells, opera in a shell",
    palette: {
      sky: "#bae6fd",
      ground: "#fde68a",
      accent: "#10b981",
    },
    center: {
      lat: -33.8688,
      lon: 151.2093,
    },
    greeterId: "jack_syd",
    defaultDistrictId: "syd-circular-quay",
    emotes: ["wave", "cheer"],
    facts: [
      {
        text: "The Opera House's roof is made of over 1 million Swedish-made tiles.",
      },
      {
        text: "Sydney Harbour Bridge is nicknamed 'the Coathanger' by locals.",
      },
      {
        text: "A proper flat white uses micro-foam so fine you can pour a ristretto rosetta.",
        kind: "flavour",
      },
    ],
    language: {
      name: "Australian English",
      script: "Aussie English",
      greetings: [
        "G'day mate!",
        "How ya going?",
        "Cheers, welcome to the harbour.",
        "Ow ya travellin'?",
      ],
      filler: ["mate", "reckon", "heaps", "no worries", "arvo", "servo", "chockers", "bloody"],
      farewells: ["Cheers mate", "Catch ya", "Hooroo", "Take it easy"],
      glossary: {
        mate: "friend (universal)",
        reckon: "think / guess",
        heaps: "lots",
        arvo: "afternoon",
        servo: "gas station",
        chockers: "completely full",
        hooroo: "goodbye (old-school)",
      },
      style:
        "Aussie English. Use 'mate', 'reckon', 'heaps', 'arvo', 'servo', 'no worries'. Relaxed, self-deprecating, short sentences. End with a friendly 'ey?' every now and then.",
    },
  },
  districts: [
    {
      id: "syd-circular-quay",
      name: "Circular Quay · The Rocks",
      blurb: "Ferries, sandstone lanes, the Opera House and the Bridge.",
      origin: {
        lat: -33.861,
        lon: 151.211,
      },
      radiusM: 800,
      spawn: {
        lat: -33.8615,
        lon: 151.2105,
      },
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
    {
      id: "syd-bondi",
      name: "Bondi Beach",
      blurb: "Surf, the Icebergs pool and Campbell Parade.",
      origin: {
        lat: -33.8908,
        lon: 151.2743,
      },
      radiusM: 700,
      spawn: {
        lat: -33.8905,
        lon: 151.276,
      },
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "syd_bondi_chippery",
      districtId: "syd-bondi",
      kind: "chippery",
      name: "Bondi Fish & Chippery",
      emoji: "🐟",
      blurb:
        "Beer-battered barramundi, chunky chips, salt on the wind, seagulls trying their luck.",
      likeness: "generic",
      location: {
        lat: -33.891,
        lon: 151.277,
      },
      placement: "approximate",
      radiusM: 10,
      hostId: "jack_syd",
      menu: ["fish-and-chips"],
      facts: [
        {
          text: "'Bondi' is usually traced to an Aboriginal word, boondi, meaning water breaking over rocks.",
          status: "corrected",
          note: "Dropped the specific language attribution (unverified).",
        },
        {
          text: "Bondi Icebergs pool is carved into the rock — ocean refills it at high tide.",
        },
        {
          text: "Bondi Surf Bathers' Life Saving Club, founded in 1907, is often called the world's first surf life-saving club.",
          status: "corrected",
          note: "Legacy claim about Australia Day events since 1907 was unsupported.",
        },
      ],
      conversation: {
        greeting: "G'day mate — fish and chips, proper wrapped? Chicken salt?",
        seeds: [
          "What's surf culture in Bondi like?",
          "How is Australian English different?",
          "Why is Australian identity tied to the beach?",
          "What should every visitor to Sydney do?",
        ],
        register: "laidback-aussie",
        canned: [
          {
            keywords: ["surf", "culture", "bondi", "waves"],
            answer:
              "Bondi's a working-class surf break, mate. Guys out at 6 a.m. before tradie shifts. The local crew's tight — respect the lineup, paddle for waves, don't drop in. Outside of that, Bondi's everyone's beach. Tourist on one side, grom on the other, all good.",
          },
          {
            keywords: ["australian", "english", "different", "accent", "slang"],
            answer:
              "We shorten everything, mate. Afternoon's 'arvo', service station's 'servo', sandwich is 'sanga', breakfast is 'brekkie'. Throw 'reckon' and 'heaps' everywhere. End sentences with 'ey'. Self-deprecating is law — never big-note yourself. You'll fit in fast if you call everyone mate, even strangers.",
          },
          {
            keywords: ["beach", "identity", "culture", "australian"],
            answer:
              "Eighty percent of Aussies live within 50 km of the coast. We're the world's driest continent and we huddle on the wet edge. Beach is democracy — no dress code, no cover charge, everyone equal in boardies. Summer at the beach is the national religion. Keeps us honest.",
          },
          {
            keywords: ["visitor", "sydney", "do", "should", "tourist"],
            answer:
              "Bondi to Coogee coastal walk, mate. Harbour Bridge climb if you've got the cash. Ferry to Manly — cheapest cruise in the world. Vivid Festival if it's on. And drink a flat white in Surry Hills, properly, or we can't be mates. That's the list.",
          },
          {
            keywords: ["aboriginal", "indigenous", "history", "first", "nation"],
            answer:
              "Before Sydney was Sydney, it was Gadigal country. The Gadigal and other Dharawal people lived here for 60,000 years. That's a long time, mate. We're trying to reckon with it properly — land acknowledgments, treaties, pay-the-rent movements. Respect. Bondi itself's a Dharawal word.",
          },
          {
            keywords: ["fish", "and", "chips", "proper", "recipe"],
            answer:
              "Beer-battered barramundi, shark, or flake. Chunky chips, not shoestring. Tomato sauce on the side, chicken salt on the chips, lemon wedge. Wrapped in newspaper, proper. Eat on a bench looking at the surf. If you sit inside to eat — you're doing it wrong.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2500,
        cityVolumeDuck: 0.3,
        indoor: false,
      },
    },
    {
      id: "syd_barista_lab",
      districtId: "syd-circular-quay",
      kind: "cafe",
      name: "Barista Lab (Surry Hills)",
      emoji: "☕",
      blurb: "Single-origin beans, 88°C pour, flat white that taught Melbourne.",
      likeness: "generic",
      location: {
        lat: -33.861,
        lon: 151.208,
      },
      placement: "approximate",
      radiusM: 8,
      hostId: "nat_syd",
      menu: ["flat-white", "lamington"],
      facts: [
        {
          text: "Flat white was invented in Australia (or New Zealand, depending on who's shouting) in the 1980s.",
        },
        {
          text: "Australian baristas steam milk to about 60–65 °C — hotter starts to taste flat.",
          kind: "flavour",
        },
        {
          text: "Specialty coffee culture runs on third-wave beans from Africa, Central America, Indonesia.",
        },
      ],
      conversation: {
        greeting: "Reckon you want a flat white? Yeah, everyone does. How's your morning?",
        seeds: [
          "What actually is a flat white?",
          "Why is Australian coffee culture so strong?",
          "How do I order properly in an Aussie café?",
          "What's your take on third-wave coffee?",
        ],
        register: "coffee-nerd-aussie",
        canned: [
          {
            keywords: ["flat", "white", "what", "actually", "different"],
            answer:
              "Double ristretto, 150ml cup, micro-foam poured so the foam sits 5mm on top. No dry foam, no spoon needed. Temperature 60-65°C — any hotter, you cook the lactose, loses sweetness. Stronger than a latte, milkier than a cappuccino. That's the lane.",
          },
          {
            keywords: ["culture", "coffee", "strong", "why", "australia"],
            answer:
              "Italian migrants post-WWII brought espresso. Melbourne and Sydney turned it into a craft obsession by the '80s. We never let Starbucks in — proudly. Every decent café has a specialty coffee program. It's a small country, baristas gossip, standards tight. Reckon we hold the world top 5 globally.",
          },
          {
            keywords: ["order", "properly", "cafe", "how"],
            answer:
              "'Flat white' covers most situations. 'Long black' if you want Americano energy. 'Piccolo' for a short ristretto with a splash of milk. Never say 'regular coffee' — means nothing here. Ask for the house roast if you're unsure. No tip culture, just say thanks proper.",
          },
          {
            keywords: ["third", "wave", "specialty", "beans", "take"],
            answer:
              "Third wave's about treating coffee like wine. Origin matters. Variety matters. Processing matters. A great Ethiopian Yirgacheffe tastes like bergamot and peach. Panama Geisha drinks like jasmine tea. We stopped disguising coffee with milk ratios — started letting the bean speak. Reckon it's the best thing that happened to the drink.",
          },
          {
            keywords: ["melbourne", "sydney", "rivalry", "coffee"],
            answer:
              "Melbourne claims the crown, mate. Fine. We're fine with that. Sydney's coffee is just as good, the sun's better, we go surfing after our flat white. You can have the rivalry. We keep the beach.",
          },
          {
            keywords: ["roast", "dark", "light", "which"],
            answer:
              "Light-to-medium for single origins, brings fruit out. Medium for blends, better for milk drinks. Dark roast — basically burnt, kills nuance, only good if you want commodity bulk coffee. We don't stock dark here. Reckon most Aussie cafés agree.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2000,
        cityVolumeDuck: 0.4,
        indoor: true,
      },
    },
    {
      id: "syd_opera_forecourt",
      districtId: "syd-circular-quay",
      kind: "landmark",
      name: "Opera House Forecourt",
      emoji: "🎭",
      blurb: "Harbour, shell roofs, a million photos a year. Sit on the steps with a flat white.",
      likeness: "public-landmark",
      location: {
        lat: -33.8575,
        lon: 151.2146,
      },
      placement: "approximate",
      radiusM: 10,
      menu: [],
      facts: [
        {
          text: "Jørn Utzon's design won an international competition in 1957. Opened 1973.",
        },
        {
          text: "The shells are clad in 1,056,006 glazed tiles made in Sweden.",
          status: "corrected",
          note: "Legacy text said each tile was individually cut.",
        },
        {
          text: "UNESCO World Heritage Site (2007). One of the most-photographed buildings alive.",
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
      id: "jack_syd",
      name: "Jack",
      homePlaceId: "syd_bondi_chippery",
      role: "host",
      bio: "Chippery surfer. Laid-back.",
      persona:
        "You are a laid-back Aussie surfer running a fish-and-chip shop. 'Yeah nah', 'no worries mate', 'heaps good'. Short sentences. Beach metaphors. Self-deprecating.",
      expertise: ["bondi-surf", "surf-culture", "fish-and-chips", "aussie-slang"],
      routine: "host",
      lines: [
        "G'day mate — fish and chips, proper wrapped?",
        "Surf's been decent this arvo.",
        "Chicken salt? No worries, heaps.",
      ],
      canned: [],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "adult",
        attire: "boardshorts and singlet, sun-bleached hair",
      },
    },
    {
      id: "nat_syd",
      name: "Nat",
      homePlaceId: "syd_barista_lab",
      role: "host",
      bio: "Barista Lab owner. Coffee nerd.",
      persona:
        "You are a coffee-nerd Aussie barista. Ratios, single-origins, tasting notes. Slightly ironic about your own obsession. 'Reckon you want a flat white?' Short answers.",
      expertise: ["flat-white", "third-wave", "filter-coffee", "aussie-slang"],
      routine: "barista",
      lines: [
        "Reckon you want a flat white? Yeah, everyone does.",
        "This Yirgacheffe's tasting like bergamot today.",
        "60–65°C milk — trust me, not hotter.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "adult",
        attire: "linen shirt, leather barista apron",
      },
    },
    {
      id: "maz_syd",
      name: "Maz",
      homePlaceId: "syd_bondi_chippery",
      role: "regular",
      bio: "Local Bondi surfer. 6 a.m. paddle, 9 a.m. flat white, 11 a.m. chips.",
      expertise: ["bondi-surf", "surf-culture", "fish-and-chips", "aussie-slang"],
      routine: "host",
      lines: [
        "Swell's pumping this arvo, mate. Get in early.",
        "Chicken salt on the chips or bust, ey.",
        "Saturday's a bit crowded — go before 7.",
      ],
      canned: [
        {
          keywords: ["surf", "bondi", "wave", "swell"],
          answer:
            "Bondi's mellow most days — beach break, crumbly. North end gets better shape. South is the drifty end. Swell from the south-east, offshore westerly, that's pumping. 6am paddle, ey, no crowd, coffee after.",
        },
        {
          keywords: ["beginner", "learn", "lesson", "board"],
          answer:
            "Foamie — soft-top 8 or 9 foot, maximum forgiveness. Let's Go Surfing at the south end does lessons. Knee-deep whitewash first, mate. Don't try Bondi on a short six-footer week one, you'll eat sand.",
        },
        {
          keywords: ["chips", "fish", "chicken", "salt"],
          answer:
            "Chicken salt on the chips, tomato sauce on the side, lemon on the fish, salt and vinegar rinse. Eat on a bench, watch the surf. Newspaper-wrap if they'll give you one. Sit inside — you've failed, mate.",
        },
      ],
      look: {
        avatarId: "body-m-young",
        presentation: "masculine",
        ageBand: "young-adult",
        attire: "wetsuit peeled to the waist, towel",
      },
    },
    {
      id: "ari_syd",
      name: "Ari",
      homePlaceId: "syd_barista_lab",
      role: "regular",
      bio: "Third-wave barista-in-training. Obsessed with extraction ratios.",
      expertise: ["espresso-science", "flat-white", "third-wave", "coffee-craft"],
      routine: "barista",
      lines: [
        "1:2 ratio, 28 seconds — chef's kiss.",
        "This Geisha's got jasmine all over the cup.",
        "Reckon light roast beats dark every time.",
      ],
      canned: [
        {
          keywords: ["espresso", "shot", "ratio", "extract"],
          answer:
            "1:2 ratio — 18g in, 36g out, 28-32 seconds. If it's gushing, grind finer. If it's choking, grind coarser. Tasting notes matter — under-extracted is sour, over-extracted is bitter, balanced is sweet. Sweet is the goal.",
        },
        {
          keywords: ["flat", "white", "latte", "cappuccino", "difference"],
          answer:
            "Flat white: 150ml, double ristretto, 5mm microfoam. Latte: 240ml, same shot, 1cm foam, milkier. Cappuccino: 180ml, single shot, dry foam, spooned-on. Australia invented flat white, New Zealand disputes, we both win.",
        },
        {
          keywords: ["bean", "roast", "origin", "third", "wave"],
          answer:
            "Third-wave treats coffee like wine. Yirgacheffe tastes like bergamot and peach. Panama Geisha drinks like jasmine tea. Light-roasted to protect the fruit. Dark roast is lazy — kills nuance. We stopped disguising beans with burnt caramel, started letting them speak.",
        },
      ],
      look: {
        avatarId: "body-n-adult",
        presentation: "neutral",
        ageBand: "young-adult",
        attire: "black tee, canvas apron, notebook of brew ratios",
      },
    },
  ],
  foods: [
    {
      id: "meat-pie",
      name: "Meat Pie",
      emoji: "🥧",
      price: 14,
      description: "Hot mince-and-gravy pie, dead horse (tomato sauce) on top.",
    },
    {
      id: "flat-white",
      name: "Flat White",
      emoji: "☕",
      price: 7,
      description: "Double espresso with micro-foam, poured for a rosetta.",
    },
    {
      id: "lamington",
      name: "Lamington",
      emoji: "🎂",
      price: 6,
      description: "Sponge cube dipped in chocolate and rolled in coconut.",
    },
    {
      id: "fish-and-chips",
      name: "Fish & Chips",
      emoji: "🍟",
      price: 16,
      description: "Beer-battered barramundi, chunky chips, lemon wedge.",
    },
  ],
  events: [
    {
      id: "syd_dawn_surf",
      placeId: "syd_bondi_chippery",
      title: "Saturday Dawn Patrol",
      blurb: "Jack opens at 5:45 for the surfers. Maz reports the swell.",
      emoji: "🏄",
      schedule: {
        dayOfWeek: 6,
        startHour: 6,
        durationHours: 3,
      },
    },
    {
      id: "syd_arvo_geisha",
      placeId: "syd_barista_lab",
      title: "Friday Geisha Filter Flight",
      blurb: "Ari pulls four origins side by side. Free if you nail three of four.",
      emoji: "🌸",
      schedule: {
        dayOfWeek: 5,
        startHour: 15,
        durationHours: 3,
      },
    },
  ],
});
