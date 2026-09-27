import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    emoji: "🌊",
    tagline: "Maximum City — seven islands of dreams, locals and monsoon chai",
    palette: {
      sky: "#93c5fd",
      ground: "#94a3b8",
      accent: "#f59e0b",
    },
    center: {
      lat: 19.076,
      lon: 72.8777,
    },
    greeterId: "priya_mum",
    defaultDistrictId: "mum-marine-drive",
    emotes: ["namaste", "laugh"],
    facts: [
      {
        text: "Mumbai's local trains carry around 7.5 million commuters every single day.",
      },
      {
        text: "Marine Drive at night is called the Queen's Necklace because of how the street lights curve.",
      },
      {
        text: "Vada pav was invented in 1966 by a street vendor next to Dadar station.",
      },
    ],
    language: {
      name: "Bombay Hindi + Marathi + English",
      script: "हिंदी + मराठी + English",
      greetings: [
        "Aye bhai! Kya scene hai?",
        "Namaskar! Kay chalu ahe?",
        "Hello hello! Pao bhaji khana hai?",
        "Bindaas yaar, welcome!",
      ],
      filler: ["bindaas", "tapori", "ekdum", "jhakaas", "kay", "chalu", "fatafat", "mast"],
      farewells: ["Chal bhai, milte hain", "Tata", "Bye-bye, safely jaa"],
      glossary: {
        bindaas: "chill / carefree (Bombay slang)",
        tapori: "street-smart / slightly rowdy affection",
        ekdum: "totally / absolutely",
        jhakaas: "fantastic (classic Amitabh)",
        kay: "what (Marathi)",
        "chalu ahe": "what's going on (Marathi)",
        mast: "awesome",
      },
      style:
        "Bombay Hindi mixed with Marathi and English. Use 'bindaas', 'ekdum jhakaas', 'kya scene hai', 'tapori'. Fast, warm, street-smart. Drop the odd 'kay chalu ahe' for flavour.",
    },
  },
  districts: [
    {
      id: "mum-marine-drive",
      name: "Marine Drive · Chowpatty",
      blurb: "The Queen's Necklace, Art Deco facades and the beach at Girgaon.",
      origin: {
        lat: 18.948,
        lon: 72.8215,
      },
      radiusM: 1000,
      spawn: {
        lat: 18.94385,
        lon: 72.82255,
      },
      // Along the Queen's Necklace toward Chowpatty, the sea on your left.
      spawnHeadingDeg: 329,
      geometry: "mum-marine-drive",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "mum_zereshk_cafe",
      districtId: "mum-marine-drive",
      kind: "restaurant",
      name: "Zereshk Café",
      emoji: "🍮",
      blurb: "Irani café off Marine Drive. Berry pulao and caramel custard. The owner chats.",
      likeness: "generic",
      location: {
        lat: 18.946,
        lon: 72.825,
      },
      placement: "approximate",
      frontage: { location: { lat: 18.946021, lon: 72.825042 }, yawDeg: 63 },
      radiusM: 10,
      hostId: "priya_mum",
      menu: ["berry-pulao"],
      facts: [
        {
          text: "Berry pulao gets its tang from zereshk, a small sour barberry grown mostly in eastern Iran.",
          status: "corrected",
          note: "Legacy text said the barberries come from Yazd.",
        },
        {
          text: "Bombay's Irani cafés were opened by Zoroastrian families from Iran, many from Yazd.",
        },
      ],
      conversation: {
        greeting: "Aavjo dikra — what'll it be? Berry pulao, caramel custard, yes?",
        seeds: [
          "What's the story of the Parsis in Bombay?",
          "How did your family end up running this place?",
          "Why is Bombay called Maximum City?",
          "What's changed in Bombay over your lifetime?",
        ],
        register: "warm-parsi-bombay",
        canned: [
          {
            keywords: ["parsi", "zoroastrian", "history", "bombay", "came"],
            answer:
              "Dikra, Parsis came to India from Persia about 1200 years ago, fleeing religious persecution. The story is — we asked the king for refuge, he sent a full glass of milk (we are full). We added sugar and sent it back (we will sweeten). He let us stay. Bombay became our home in the 1800s.",
          },
          {
            keywords: ["family", "restaurant", "cafe", "how", "started"],
            answer:
              "My grandfather came from Yazd in the 1930s. Opened a small café for the dock workers. Berry pulao was his wife's recipe. Ninety years later we still cook it her way, same zereshk, same patience. Three generations now.",
          },
          {
            keywords: ["bombay", "mumbai", "maximum", "city", "why"],
            answer:
              "Suketu Mehta wrote that — Maximum City. Maximum everything. Maximum people, maximum ambition, maximum hope, maximum heartbreak. On any street you have the billionaire and the pavement-sleeper. It's hard, dikra, but it's honest. Bombay chooses no one and welcomes everyone.",
          },
          {
            keywords: ["changed", "lifetime", "old", "different", "bombay"],
            answer:
              "Everything changed, dikra. We had trams on Dadabhai Naoroji Road when I was a boy. Everyone walked. You knew your fishmonger, your cobbler, your priest. Now — towers, traffic, strangers. But Juhu beach at sunset is still the same. Some things Bombay keeps safe.",
          },
          {
            keywords: ["berry", "pulao", "zereshk", "iran", "dish"],
            answer:
              "Zereshk — Iranian barberry. Tiny, sour, crimson. We cook basmati rice with saffron and fried onions, scatter the zereshk on top with slivered almonds. The sour-sweet balance is the whole dish. My grandmother said — if you make it without zereshk, call it something else.",
          },
          {
            keywords: ["caramel", "custard", "dessert", "recipe"],
            answer:
              "Caramel custard is deceptively simple — eggs, milk, sugar, vanilla, patience. The caramel must be the colour of mahogany, never black. Then bain-marie for an hour. Leave it overnight. Dikra, every Parsi household has its own version. Ours is the best. Don't tell the others.",
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
      id: "mum_chowpatty_stall",
      districtId: "mum-marine-drive",
      kind: "food_stall",
      name: "Chowpatty Vada Pav Stall",
      emoji: "🥪",
      blurb: "Marine Drive's sand, Arabian sea, vada pav the size of a fist.",
      likeness: "generic",
      location: {
        lat: 18.9545,
        lon: 72.815,
      },
      placement: "approximate",
      frontage: { location: { lat: 18.954511, lon: 72.81501 }, yawDeg: 221 },
      radiusM: 8,
      hostId: "rohan_mum",
      menu: ["vada-pav", "cutting-chai", "bhel-puri"],
      facts: [
        {
          text: "Vada pav was invented in 1966 by Ashok Vaidya at a Dadar station stall.",
        },
        {
          text: "Chowpatty beach hosts Ganpati Visarjan — millions come for the festival.",
        },
        {
          text: "Bhel puri's perfect bite has puffed rice, sev, tamarind, onion, lime, coriander — all crunchy and tangy.",
        },
      ],
      conversation: {
        greeting: "Aye bhai, vada pav garam hai — ek lega? Tikha ya normal?",
        seeds: [
          "Who invented vada pav and how?",
          "What makes a proper bhel puri?",
          "What happens at Chowpatty during Ganpati?",
          "Teach me some Bombay tapori slang",
        ],
        register: "fast-tapori-hindi",
        canned: [
          {
            keywords: ["vada", "pav", "invent", "history", "who"],
            answer:
              "Ashok Vaidya, 1966, Dadar station. Mill workers needed something cheap and fast. He squeezed a spiced potato fritter inside a pav with green and red chutney. Ek rupaya. Sixty years later, Bombay eats two crore vada pavs daily. Salute to him, bhai.",
          },
          {
            keywords: ["bhel", "puri", "proper", "make", "ingredient"],
            answer:
              "Seven things in bhel, bhai — puffed rice, sev, boiled potato, raw onion, tomato, coriander, tamarind chutney. Mix last, eat fast. If it's soggy, we did wrong. Waterfront wala bhel is king — the salt air is the eighth ingredient. Kya bolte ho?",
          },
          {
            keywords: ["ganpati", "visarjan", "festival", "chowpatty"],
            answer:
              "Ten days of Ganpati, bhai. The biggest day is Anant Chaturdashi. Lakhs come to Chowpatty with their idols. Music, drums, the whole road becomes a river of people. At sunset, Ganesha goes into the sea. Bindaas. It's Bombay's biggest collective feeling.",
          },
          {
            keywords: ["tapori", "bombay", "slang", "teach", "words"],
            answer:
              "Tapori slang, ha. 'Bindaas' — chill. 'Ekdum jhakaas' — absolutely fantastic. 'Kya scene hai' — what's happening. 'Bhai log' — our friends. 'Fatafat' — quickly. 'Tapori' — street-smart loafer with affection. Chal, bol — 'ek vada pav fatafat bhai'. Perfect.",
          },
          {
            keywords: ["spicy", "tikha", "chili", "hot"],
            answer:
              "Ya ya, tikha wala lagao? Green chutney alone — medium. Add red garlic chutney — nuclear. Garlic chutney with dry red chili powder — Bombay challenge mode. I've seen tourists cry. But bhai, if you can't eat it, just sip cutting chai. Chai bujhata hai.",
          },
          {
            keywords: ["cutting", "chai", "why", "half", "glass"],
            answer:
              "Cutting means half-glass, bhai. Mill workers had ten-minute breaks. Full glass of chai takes fifteen. So — cutting. Shared between two also — one glass, two sips, done. Chai ki philosophy Bombay mein chhoti hai, taste badi.",
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
      id: "mum_marine_drive_walk",
      districtId: "mum-marine-drive",
      kind: "promenade",
      name: "Marine Drive",
      emoji: "🌊",
      blurb: "Queen's Necklace at dusk. Joggers, lovers, bhel vendors, the Arabian Sea.",
      likeness: "public-landmark",
      location: {
        lat: 18.943908,
        lon: 72.822484,
      },
      placement: "approximate",
      radiusM: 10,
      menu: [],
      facts: [
        {
          text: "Built on reclaimed land in the 1920s. 3.6 km curve along the Arabian Sea.",
        },
        {
          text: "The street-lamps glow amber at night — hence 'Queen's Necklace'.",
        },
        {
          text: "Art Deco facades on the east side are UNESCO-listed (2018).",
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
      id: "priya_mum",
      name: "Priya",
      homePlaceId: "mum_zereshk_cafe",
      role: "host",
      bio: "Third-generation owner of Zereshk Café. Full of stories.",
      persona:
        "You are the Parsi owner of an old Irani café near Marine Drive. Gracious, nostalgic, story-loving. Short affectionate exclamations in Gujarati-tinged English. 'Aavjo dikra', 'tell me darling', 'berry pulao, best thing'. Slow cadence.",
      expertise: ["parsi-cuisine", "parsi-history", "bombay-lore", "story-telling"],
      routine: "host",
      lines: [
        "Aavjo dikra — berry pulao ready.",
        "Caramel custard is my grandmother's.",
        "Bombay hasn't really changed, only looks different.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "middle-aged",
        attire: "printed cotton sari, reading glasses on a chain",
      },
    },
    {
      id: "rohan_mum",
      name: "Rohan",
      homePlaceId: "mum_chowpatty_stall",
      role: "host",
      bio: "Chowpatty vada pav fast-talker.",
      persona:
        "You are a loud, tapori street vendor at Chowpatty. Fast, half-Marathi half-Hindi. 'Ek vada pav, tikha ya normal?' 'Bindaas hai!' 'Chal chal, next.' Dare the customer to eat spicier. Quick banter only.",
      expertise: ["street-food", "bombay-tapori", "cutting-chai", "cricket"],
      routine: "street_vendor",
      lines: [
        "Aye bhai! Vada pav garam hai — tikha?",
        "Ek vada pav ekdum jhakaas hai.",
        "Cutting chai lega? Fatafat!",
      ],
      canned: [],
      look: {
        avatarId: "body-m-young",
        presentation: "masculine",
        ageBand: "young-adult",
        attire: "cotton vest, apron, towel on the shoulder",
      },
    },
    {
      id: "dadi_mum",
      name: "Dadi",
      homePlaceId: "mum_zereshk_cafe",
      role: "regular",
      bio: "Parsi matriarch. Berry pulao keeper. Priya's elder aunt.",
      expertise: ["parsi-cuisine", "parsi-history", "bombay-lore", "story-telling"],
      routine: "host",
      lines: [
        "Dikra — zereshk must be deep red, never brown. Dadaji knew.",
        "Bombay was quieter in the 60s. You had time.",
        "Caramel custard — don't burn. Colour of mahogany.",
      ],
      canned: [
        {
          keywords: ["berry", "pulao", "zereshk", "recipe"],
          answer:
            "Dikra — zereshk must be deep red, never brown. We've had the same supplier since 1961. Soak zereshk for ten minutes. Fry in ghee with sugar for three. Scatter on basmati-saffron rice with slivered almond. My grandmother would slap me if I got the ratio wrong.",
        },
        {
          keywords: ["parsi", "history", "zoroastrian", "community"],
          answer:
            "Dikra, Parsis came to Gujarat first, then Bombay when the dockyards opened. My grandfather landed at the Bombay docks. Three generations later, we run a café older than the country. Think about that.",
        },
        {
          keywords: ["bombay", "old", "changed", "then"],
          answer:
            "In the 60s, Bombay had trams on Dadabhai Naoroji Road. I walked to school in Byculla. Knew the fishmonger, the cobbler, the priest by name. Now — towers everywhere. Juhu sunset still same. Some things Bombay can't spoil.",
        },
      ],
      look: {
        avatarId: "body-f-senior",
        presentation: "feminine",
        ageBand: "senior",
        attire: "embroidered gara sari, pearl earrings",
      },
    },
    {
      id: "salman_mum",
      name: "Salman",
      homePlaceId: "mum_chowpatty_stall",
      role: "regular",
      bio: "Cabbie on Marine Drive. Knows every Bollywood film set location.",
      expertise: ["bombay-tapori", "local-trains", "cricket", "bombay-lore"],
      routine: "street_vendor",
      lines: [
        "Local mein seat milegi kya is time? Sochle.",
        "Aaj Virat ne kya kiya bhai — hundred, no?",
        "Marine Drive pe queen's necklace, bindaas view.",
      ],
      canned: [
        {
          keywords: ["local", "train", "commute", "station"],
          answer:
            "Bhai — fast local Churchgate to Borivali, 45 minutes dry day, 2 hours monsoon. Catch the second-class fourth compartment from the front, always less crowded. Window seat pe chale toh view ekdum filmy.",
        },
        {
          keywords: ["bollywood", "film", "location", "shooting"],
          answer:
            "Marine Drive — Wake Up Sid, Rockstar, half of SRK's 90s. Bandstand — Kabhi Khushi Kabhie Gham. Nariman Point — A Wednesday. Bhai, I've driven three actors home from sets. No names. Taxi wala ka code.",
        },
        {
          keywords: ["cricket", "virat", "match", "score"],
          answer:
            "Aaj Virat ne cover drive mara, bindaas. Uska timing abhi bhi alag hai, 35 years. Sachin tendulkar ek generation ko bana gaya, Virat doosri ko. Ranji Trophy se IPL tak — Bombay cricket ka heartbeat.",
        },
      ],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "middle-aged",
        attire: "khaki taxi-driver's shirt",
      },
    },
  ],
  foods: [
    {
      id: "vada-pav",
      name: "Vada Pav",
      emoji: "🥪",
      price: 10,
      description: "Spiced potato fritter in a pav with garlic-peanut chutney.",
    },
    {
      id: "cutting-chai",
      name: "Cutting Chai",
      emoji: "🍵",
      price: 5,
      description: "Half a glass of strong spiced tea — the commute companion.",
    },
    {
      id: "pav-bhaji",
      name: "Pav Bhaji",
      emoji: "🍲",
      price: 18,
      description: "Buttery mashed-veg curry with toasted pav.",
    },
    {
      id: "bhel-puri",
      name: "Bhel Puri",
      emoji: "🥗",
      price: 12,
      description: "Puffed rice, sev, tamarind and mint — chaat on a beach.",
    },
    {
      id: "berry-pulao",
      name: "Berry Pulao",
      emoji: "🍚",
      price: 20,
      description: "Irani-style pulao with tart barberries, fried onions and chicken or mutton.",
    },
  ],
  events: [
    {
      id: "mum_marine_sunset",
      placeId: "mum_chowpatty_stall",
      title: "Sunset Vada Pav Hour",
      blurb:
        "Rohan hands them out hot. Salman tells Bollywood stories. Queen's Necklace lights up at 7.",
      emoji: "🌇",
      schedule: {
        dayOfWeek: 6,
        startHour: 18,
        durationHours: 2,
      },
    },
  ],
});
