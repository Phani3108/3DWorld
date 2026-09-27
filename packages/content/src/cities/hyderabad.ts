import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "hyderabad",
    name: "Hyderabad",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    emoji: "🏛️",
    tagline: "City of Nizams — pearls, biryani and Charminar at sunset",
    palette: {
      sky: "#f4c274",
      ground: "#d98838",
      accent: "#ef4444",
    },
    center: {
      lat: 17.385,
      lon: 78.4867,
    },
    greeterId: "farah_hyd",
    defaultDistrictId: "hyd-old-city",
    emotes: ["namaste", "dance"],
    facts: [
      {
        text: "Charminar was built in 1591 to mark the end of a deadly plague.",
      },
      {
        text: "Hyderabadi biryani is cooked in a sealed pot using the dum method.",
      },
      {
        text: "The Golconda Fort has acoustics so precise, a handclap at the entrance echoes at the top.",
      },
    ],
    language: {
      name: "Hyderabadi Urdu + Telugu",
      script: "हैदराबादी اُردو + తెలుగు",
      greetings: [
        "Aadab sahab!",
        "Namaskaram!",
        "Kaisa hai bhai, bagunnara?",
        "Welcome bhai — chai pee lo.",
      ],
      filler: ["kaiku", "bolo", "kya", "haan bhai", "baigan", "emaindi", "sahi", "haula"],
      farewells: ["Khuda hafiz", "Alvida", "Velthaanu", "Chalo bhai, milte hain"],
      glossary: {
        kaiku: "why (Hyderabadi Urdu)",
        bolo: "tell me / go on",
        baigan: "literally eggplant, used as 'weird' or 'yikes'",
        haula: "silly / crazy (affectionate)",
        emaindi: "what happened? (Telugu)",
        "khuda hafiz": "goodbye (Urdu, lit. 'God protect')",
      },
      style:
        "Write in Hyderabadi Urdu sprinkled with Telugu words. Use 'kaiku', 'bolo', 'haan bhai', 'aadab', 'khuda hafiz' naturally. Warm, teasing, slightly dramatic. Don't translate every phrase — let the mood carry.",
    },
  },
  districts: [
    {
      id: "hyd-old-city",
      name: "Old City · Charminar",
      blurb: "Charminar, Laad Bazaar and Gulzar Houz — the 16th-century heart of Hyderabad.",
      origin: {
        lat: 17.36158,
        lon: 78.47466,
      },
      radiusM: 700,
      // On the road north of Charminar Circle, facing the monument.
      spawn: {
        lat: 17.362095,
        lon: 78.474716,
      },
      geometry: "hyd-old-city",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "hyd_paradise_biryani",
      districtId: "hyd-old-city",
      kind: "restaurant",
      name: "Paradise Biryani House",
      emoji: "🍛",
      blurb: "Dum-cooked mutton biryani, since 1953. The queue is the review.",
      likeness: "real-business",
      location: {
        lat: 17.361797,
        lon: 78.474114,
      },
      placement: "relocated",
      radiusM: 12,
      hostId: "farah_hyd",
      menu: ["biryani", "haleem", "osmania-biscuit"],
      facts: [
        {
          text: "Dum cooking seals the pot with dough so nothing escapes — the meat's juices cook the rice.",
        },
        {
          text: "Paradise started as a tiny café near the Secunderabad railway station in 1953.",
          note: "History of a real business — verify, or drop if the venue is fictionalised.",
        },
        {
          text: "Hyderabadi biryani uses *kachche gosht* — raw marinated mutton, layered with raw rice.",
        },
      ],
      conversation: {
        greeting: "Aadab sahab — biryani ke liye aaye kya? Do minute, garam aata hai.",
        seeds: [
          "What actually makes Hyderabadi biryani different from Lucknow's?",
          "Why is dum cooking so important?",
          "Tell me about the story of Paradise restaurant",
          "Kachche gosht or pakki — which is better?",
        ],
        register: "warm-formal-urdu",
        canned: [
          {
            keywords: ["lucknow", "different", "difference", "compare", "compared"],
            answer:
              "Aadab sahab. Lucknowi biryani is *pakki* — meat is cooked first, then layered with rice. We cook *kachche* — raw marinated mutton, raw rice, saffron, fried onion, sealed in a dough-lined handi and dummed over slow coal. The meat's juices steam the rice. Lucknow eats delicate. Hum bold khaate hain.",
          },
          {
            keywords: ["dum", "cooking", "method", "how", "sealed"],
            answer:
              "Dum means slow-cooking in a sealed pot. We layer the raw mutton, rice, mint, fried onions, saffron milk. Then a rope of dough goes around the lid to trap every bit of steam. Low coal underneath, hot coals on the lid. Thirty to forty minutes. Opening it is the best smell in the world, bolo.",
          },
          {
            keywords: ["paradise", "story", "history", "started", "begin"],
            answer:
              "Paradise started in 1953 as a small café near Secunderabad station. Biryani was a side item. Customers kept coming back for it, so by the '70s the café became a biryani house. Now we have a queue every lunch, every dinner, every Ramzan.",
          },
          {
            keywords: ["kachche", "pakki", "pakka", "which", "better"],
            answer:
              "Haan bhai — kachche is for those who love risk and reward. One mistake and the meat is tough. Done right, it's the most tender biryani you'll eat. Pakki is safer but less soul. Hyderabad ka answer — kachche, always.",
          },
          {
            keywords: ["haleem", "ramzan", "ramadan", "month"],
            answer:
              "Haleem is Ramzan's gift. Wheat, lentils, mutton, slow-pounded for eight hours till it's velvet. Broken into glass bowls at iftar with fried onions and lime. Sahab — Ramzan ke baad haleem bhi chala jaata hai. So come when you can.",
          },
          {
            keywords: ["saffron", "zafran", "kesar", "spice"],
            answer:
              "Saffron is Kashmir's, but we use it like locals. A pinch soaked in warm milk, drizzled on the top layer before dumming. You don't see it much — you see the orange streaks and smell it from the next street.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2500,
        cityVolumeDuck: 0.25,
        indoor: true,
      },
    },
    {
      id: "hyd_niloufer_cafe",
      districtId: "hyd-old-city",
      kind: "tea_stall",
      name: "Niloufer Café",
      emoji: "☕",
      blurb: "Irani chai and Osmania biscuits since forever. Marble tables, loud radios.",
      likeness: "real-business",
      location: {
        lat: 17.361634,
        lon: 78.475225,
      },
      placement: "relocated",
      radiusM: 8,
      hostId: "asad_hyd",
      menu: ["irani-chai", "osmania-biscuit"],
      facts: [
        {
          text: "Irani migrants from Persia opened many of Hyderabad's tea-houses in the early 20th century.",
          status: "corrected",
          note: "Legacy text pinned the arrival to the 1930s; Irani cafés predate that. Dates unverified.",
        },
        {
          text: "An Irani chai brews long, then khoya is added for the creamy finish.",
        },
        {
          text: "Osmania biscuit is sweet-salt — designed to dunk.",
        },
      ],
      conversation: {
        greeting: "Kaiku late aayein bhai? Chai lage ya special?",
        seeds: [
          "What makes Irani chai different from regular chai?",
          "Why is Osmania biscuit sweet and salty?",
          "Tell me about the Iranis who came to Hyderabad",
          "Teach me some Hyderabadi Urdu",
        ],
        register: "casual-urdu",
        canned: [
          {
            keywords: ["irani", "chai", "different", "regular"],
            answer:
              "Irani chai is long-brewed, bhai. Fifteen minutes on the stove, not five. Then we stir in khoya — thickened milk solids. That's why it's creamy even without cream. Regular chai is quick. Irani chai is patient.",
          },
          {
            keywords: ["osmania", "biscuit", "sweet", "salty", "why"],
            answer:
              "Osmania is named after the last Nizam. He liked a biscuit that went with tea — not too sweet, not too salty. Bolo, ek biscuit mein sweet aur salt dono? That's why you can dunk it ten times and it still tastes good.",
          },
          {
            keywords: ["iranis", "iran", "history", "came", "migrate"],
            answer:
              "Iranis arrived in the 1930s from Yazd. They opened little tea-houses across Bombay and Hyderabad. Round marble tables, bentwood chairs, glass jars of biscuits. These cafés became the democracy of the city — rickshaw wallahs and lawyers at the same table.",
          },
          {
            keywords: ["urdu", "hyderabadi", "teach", "phrase", "words"],
            answer:
              "Ya, sun. 'Kaiku' means why. 'Bolo' means tell me. 'Haula' — silly, with love. 'Baigan' means eggplant but we say it for 'yikes'. String them: 'Kaiku late aayein bhai, traffic baigan tha kya?' That's Hyderabad.",
          },
          {
            keywords: ["cricket", "score", "match", "india"],
            answer:
              "Cricket? Bhai, Charminar ke peeche chai peete kitne ball-by-ball commentary kiya hoga. This week India looks okay, bowling a little loose. Pujara ghar chala gaya kya, sahi keh rahe? Bolo, next match pe shart lagate hain.",
          },
          {
            keywords: ["weather", "mausam", "today", "hot", "monsoon"],
            answer:
              "Aaj mausam baigan hai bhai. Dhoop kadak, humidity ghatak. Chai pi ke thodi der baitho, ceiling fan best conditioner. Monsoon mein dekhna — Hussain Sagar ka pani road tak aata hai.",
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
      id: "hyd_charminar_bazaar",
      districtId: "hyd-old-city",
      kind: "landmark",
      name: "Charminar Bazaar",
      emoji: "🕌",
      blurb: "Four-minaret heart of the old city. Pearls, lac bangles, chai on every corner.",
      likeness: "public-landmark",
      location: {
        lat: 17.36158,
        lon: 78.47466,
      },
      placement: "real",
      radiusM: 12,
      menu: [],
      facts: [
        {
          text: "Built in 1591 by Muhammad Quli Qutb Shah to mark the end of a plague.",
        },
        {
          text: "The surrounding bazaar is India's largest pearl market.",
        },
        {
          text: "A popular story links Charminar's four minarets to the first four caliphs.",
          status: "corrected",
          note: "Minaret height is quoted variously (48.7 m, 56 m) — dropped until sourced.",
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
      id: "farah_hyd",
      name: "Farah",
      homePlaceId: "hyd_paradise_biryani",
      role: "host",
      bio: "Host at Paradise Biryani House. Talks biryani and weather.",
      persona:
        "You are Farah, the host of a decades-old Hyderabadi biryani house. Warm, unhurried, a little teasing. Greet in 'Aadab' or 'Salaam'. Use 'bhai', 'sahab'. Talk about dum, mutton, saffron, kachche gosht. When the kitchen is busy, tease the wait.",
      expertise: ["biryani", "dum-cooking", "kachche-gosht", "haleem", "hyderabadi-urdu"],
      routine: "host",
      lines: [
        "Aadab sahab — biryani garam aa raha hai.",
        "Queue lambi hai bhai, par worth it.",
        "Sahab, haleem bhi try karo.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "middle-aged",
        attire: "cotton salwar kameez and dupatta, order book in hand",
      },
    },
    {
      id: "asad_hyd",
      name: "Asad",
      homePlaceId: "hyd_niloufer_cafe",
      role: "host",
      bio: "Niloufer counter uncle. Cricket and chai.",
      persona:
        "You're the uncle behind the counter at an Irani café. Quick, teasing Hyderabadi Urdu. Chai-stall banter. Short lines. Reference cricket, traffic, the weather. Close with 'kya bolte ho?' or 'hain?'",
      expertise: ["irani-chai", "hyderabadi-urdu", "cricket", "ramzan-iftar"],
      routine: "chat_stall",
      lines: [
        "Kaiku late aayein bhai? Chai special?",
        "Osmania biscuit dunkne ke liye hai.",
        "Match dekha kya, bolo?",
      ],
      canned: [],
      look: {
        avatarId: "body-m-senior",
        presentation: "masculine",
        ageBand: "senior",
        attire: "half-sleeve checked shirt, grey trousers, pen in the pocket",
      },
    },
    {
      id: "naseem_hyd",
      name: "Naseem",
      homePlaceId: "hyd_niloufer_cafe",
      role: "regular",
      bio: "Chess regular at Niloufer. Beats every uncle on the corner.",
      expertise: ["chess", "hyderabadi-urdu", "political-banter", "cricket"],
      routine: "chat_stall",
      lines: [
        "Shatranj khelega bhai? Chai meri.",
        "Naya politics wala drama dekha? Baigan hai.",
        "Board laga diya — pehla move tera.",
      ],
      canned: [
        {
          keywords: ["chess", "shatranj", "play", "game", "move"],
          answer:
            "Shatranj khel bhai — haan Niloufer mein, har subah. King's Indian Defence mera signature. Ek game pe chai, do game pe biscuit, teen game pe samosa — yeh system hai.",
        },
        {
          keywords: ["politics", "political", "news", "election", "drama"],
          answer:
            "Aaj kal politics ek reality show ban gaya, bhai. Sab kuch theatrical, kuch nahi serious. Chai ke saath dekhna, neat entertainment. Beta mat lo seriously.",
        },
        {
          keywords: ["urdu", "hyderabadi", "word", "teach"],
          answer:
            "Sun — 'kaiku' is why, 'haula' is silly-affectionate, 'baigan' we use for yikes. 'Nakko' is no, 'mereku' is to me. Stitch them: 'kaiku nakko baigan?' = 'why this yikes, no?'. That's Hyderabad.",
        },
      ],
      look: {
        avatarId: "body-m-senior",
        presentation: "masculine",
        ageBand: "senior",
        attire: "beige kurta pyjama, reading glasses",
      },
    },
    {
      id: "zara_hyd",
      name: "Zara",
      homePlaceId: "hyd_paradise_biryani",
      role: "regular",
      bio: "Dum-cook at Paradise. Saffron smuggler. Farah's right hand.",
      expertise: ["dum-cooking", "kachche-gosht", "biryani"],
      routine: "host",
      lines: [
        "Saffron aaj thoda mehenga, Farah ko mat batana.",
        "Kachche gosht — ek timing wrong and sab kharab.",
        "Dum khula mat karna, bhai. Steam jaata hai.",
      ],
      canned: [
        {
          keywords: ["dum", "timing", "coal", "cook", "how long"],
          answer:
            "Thirty-five minutes, low coal underneath, hot coals on the lid. Don't open it. Open karo toh steam nikal gaya, rice under-cook ho gaya. Farah checks by the smell — crusted onion, saffron, then ready.",
        },
        {
          keywords: ["kachche", "gosht", "marinate", "raw", "meat"],
          answer:
            "Kachche gosht — raw mutton marinated 6 hours in yoghurt, ginger-garlic, green chilli, mint, salt. Layered raw with half-cooked rice, saffron milk, birista. The meat cooks *in* the rice's steam. Delicate balance. One wrong step, tough meat.",
        },
        {
          keywords: ["saffron", "zafran", "kesar", "amount"],
          answer:
            "A pinch soaked in warm milk for ten minutes. Drizzled in streaks on the top rice layer before dumming. Kashmir ka saffron, Yazd wala bhi chalega. Zyada mat daalna — bitter ho jaata hai.",
        },
      ],
      look: {
        avatarId: "body-f-young",
        presentation: "feminine",
        ageBand: "young-adult",
        attire: "chef's whites, sleeves rolled, hair tied back",
      },
    },
  ],
  foods: [
    {
      id: "biryani",
      name: "Hyderabadi Biryani",
      emoji: "🍛",
      price: 25,
      description: "Dum-cooked long-grain rice with mutton or chicken, saffron, mint.",
    },
    {
      id: "irani-chai",
      name: "Irani Chai",
      emoji: "☕",
      price: 5,
      description: "Slow-brewed tea with khoya, best at a cafe that's at least 80 years old.",
    },
    {
      id: "haleem",
      name: "Haleem",
      emoji: "🥣",
      price: 20,
      description: "Slow-cooked wheat, lentils and meat — only in Ramzan, never otherwise.",
    },
    {
      id: "osmania-biscuit",
      name: "Osmania Biscuit",
      emoji: "🍪",
      price: 3,
      description: "Sweet-salt biscuit to dunk in your chai.",
    },
  ],
  events: [
    {
      id: "hyd_weekend_biryani",
      placeId: "hyd_paradise_biryani",
      title: "Sunday Mutton Special",
      blurb: "Farah opens the bigger handi. Bring patience and a friend.",
      emoji: "🍛",
      schedule: {
        dayOfWeek: 0,
        startHour: 12,
        durationHours: 4,
      },
    },
    {
      id: "hyd_chai_chess",
      placeId: "hyd_niloufer_cafe",
      title: "Friday Evening Chess",
      blurb: "Naseem brings the board. Asad keeps the chai coming.",
      emoji: "♟️",
      schedule: {
        dayOfWeek: 5,
        startHour: 18,
        durationHours: 3,
      },
    },
  ],
});
