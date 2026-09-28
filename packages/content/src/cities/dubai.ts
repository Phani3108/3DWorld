import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    emoji: "🏙️",
    tagline: "Desert turned skyline — souks, sand and tallest tower in the world",
    palette: {
      sky: "#fde68a",
      ground: "#e7c28a",
      accent: "#d4a017",
    },
    center: {
      lat: 25.2048,
      lon: 55.2708,
    },
    greeterId: "layla_dxb",
    defaultDistrictId: "dxb-deira",
    emotes: ["salaam", "bow"],
    facts: [
      {
        text: "Burj Khalifa is 828 m tall, and its spire can be seen from about 95 km away on a clear day.",
        status: "corrected",
        note: "Legacy text reversed the claim (seeing the tower vs. seeing from it).",
      },
      {
        text: "The Dubai Gold Souk has over 300 shops and trades around 10 tonnes of gold at any moment.",
      },
      {
        text: "Dubai's metro is one of the longest fully-automated driverless networks.",
      },
    ],
    language: {
      name: "Gulf English + Arabic",
      script: "خليجي English + عربي",
      greetings: [
        "Ahlan wa sahlan!",
        "Marhaba habibi, welcome.",
        "Salaam! Kaif halak?",
        "Ahlan! Chai or gahwa first?",
      ],
      filler: ["habibi", "yallah", "inshallah", "mashallah", "khalas", "walla"],
      farewells: ["Ma'a salama", "Allah ma'ak", "Yallah bye"],
      glossary: {
        habibi: "my friend / my love (warm)",
        yallah: "let's go / c'mon",
        inshallah: "God willing",
        mashallah: "wonderful / as God willed",
        khalas: "enough / done",
        walla: "I swear / really",
      },
      style:
        "Speak warm Gulf English with Arabic sprinkles. Use 'habibi', 'yallah', 'inshallah', 'mashallah'. Generous, slightly effusive host energy. Offer tea or coffee before the answer.",
    },
  },
  districts: [
    {
      id: "dxb-deira",
      name: "Deira · Gold Souk",
      blurb: "Souks, abras and the Creek — old Dubai's trading quarter.",
      origin: {
        lat: 25.2697,
        lon: 55.297,
      },
      radiusM: 700,
      spawn: {
        lat: 25.269314,
        lon: 55.295759,
      },
      spawnHeadingDeg: 55,
      geometry: "dxb-deira",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
    {
      id: "dxb-marina",
      name: "Dubai Marina",
      blurb: "Towers, yachts and a waterfront promenade.",
      origin: {
        lat: 25.079,
        lon: 55.14,
      },
      radiusM: 700,
      spawn: {
        lat: 25.08005,
        lon: 55.14062,
      },
      spawnHeadingDeg: 131,
      geometry: "dxb-marina",
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "dxb_gold_souk",
      districtId: "dxb-deira",
      kind: "market",
      name: "Gold Souk (Deira)",
      emoji: "🪙",
      blurb: "300+ shops, 10 tonnes of gold on display at any time. Bargain hard.",
      likeness: "public-landmark",
      location: {
        lat: 25.2697,
        lon: 55.297,
      },
      placement: "approximate",
      frontage: { location: { lat: 25.269484, lon: 55.296895 }, yawDeg: 42 },
      radiusM: 10,
      hostId: "layla_dxb",
      menu: ["arabic-coffee"],
      facts: [
        {
          text: "Retail gold rates in Dubai are published several times a day; jewellery is priced by weight plus a making charge.",
          status: "corrected",
          note: "Legacy text credited the DGCX (a derivatives exchange) with setting prices twice daily.",
        },
        {
          text: "Bargaining is expected — start at 40% off the quoted price, work up to 25%.",
          kind: "flavour",
        },
        {
          text: "Arabic coffee is served free in most shops to buyers who browse long.",
        },
      ],
      conversation: {
        greeting: "Ahlan habibi! What are you looking for? 22-carat, 24, Saudi chain?",
        seeds: [
          "How should I bargain here without insulting anyone?",
          "What's the difference between 22k and 24k gold?",
          "Why is there so much gold in Dubai?",
          "Teach me some Gulf Arabic expressions",
        ],
        register: "warm-gulf-english",
        canned: [
          {
            keywords: ["bargain", "haggle", "negotiate", "how much", "price"],
            answer:
              "Habibi, first — accept the coffee. Then smile, take your time, lift the piece, feel the weight. When I say a number, you pause. You say 'walla, that's beautiful, but'. Then 40% less. We dance there. Usually land 25% off. Never walk away angry — always smile, come tomorrow.",
          },
          {
            keywords: ["22k", "24k", "carat", "karat", "difference", "pure"],
            answer:
              "Walla, good question. 24-karat is pure — soft, you can bend with your thumb. Beautiful to look at, useless for a ring. 22-karat is 91.6% gold, 8.4% alloy — strong enough to wear. Most Indian gold you'll see here is 22k. 18k is for diamond settings — hardest.",
          },
          {
            keywords: ["why", "gold", "dubai", "much", "so"],
            answer:
              "Dubai is the bridge, habibi. Gold comes from Africa, India, Europe — Dubai is where it trades. No gold tax. Stable currency. Everyone trusts the weights. So all the dealers ended up here. Result: ten tonnes walking around the Souk any moment, inshallah.",
          },
          {
            keywords: ["arabic", "gulf", "teach", "phrase", "words", "expression"],
            answer:
              "Yallah, listen. 'Habibi' is my friend. 'Yallah' is let's go. 'Inshallah' — God willing, we say for anything future. 'Mashallah' for anything beautiful. 'Khalas' is 'enough / done'. String them: 'Yallah habibi, mashallah this piece, we can do good price, inshallah you come back.'",
          },
          {
            keywords: ["coffee", "gahwa", "arabic", "why", "offer"],
            answer:
              "Gahwa is an invitation, not just a drink. Cardamom, a little saffron, served small. When a guest takes gahwa, we have time. No coffee — quick buy. Coffee — we talk. That's Gulf hospitality, habibi. Even the Ritz learned it from the Bedouin.",
          },
          {
            keywords: ["real", "fake", "authentic", "trust", "hallmark"],
            answer:
              "Every legitimate piece here is hallmarked — look for the small 916 or 750 stamp. The Dubai Central Laboratory inspects this Souk twice a year. Walla, if someone won't let you weigh the piece — walk. A real seller will weigh it in front of you, here, now.",
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
      id: "dxb_desert_majlis",
      districtId: "dxb-deira",
      kind: "majlis",
      name: "Desert Majlis",
      emoji: "🏜️",
      blurb: "Low cushions, oud music, Arabic coffee poured standing. Hospitality as art.",
      likeness: "generic",
      location: {
        lat: 25.2685,
        lon: 55.2945,
      },
      placement: "approximate",
      frontage: { location: { lat: 25.268591, lon: 55.294501 }, yawDeg: 128 },
      radiusM: 10,
      hostId: "omar_dxb",
      menu: ["arabic-coffee", "camel-milk-chocolate", "luqaimat"],
      facts: [
        {
          text: "A majlis is literally 'a place of sitting' — in Arabic culture it's the room where you host.",
        },
        {
          text: "Gahwa is served and received with the right hand; gently shake the little cup when you've had enough.",
          status: "corrected",
          note: "Legacy text described the hands the other way round.",
        },
        {
          text: "Dates accompany coffee because they balance the bitterness with slow sugar.",
        },
      ],
      conversation: {
        greeting: "Marhaba. Sit, sit. Gahwa first, then we talk.",
        seeds: [
          "What does hospitality mean in Bedouin culture?",
          "Why do Emiratis read the stars?",
          "What's the philosophy behind the majlis?",
          "How is Dubai both ancient and brand new?",
        ],
        register: "philosophical-gulf",
        canned: [
          {
            keywords: ["hospitality", "bedouin", "guest", "culture"],
            answer:
              "A guest is a gift from God. In the desert, if you turned someone away they died — so we don't. Three days without question: shelter, food, water. Only on the fourth day we ask who you are. This is why Emiratis still open doors before asking.",
          },
          {
            keywords: ["stars", "navigation", "bedouin", "sky"],
            answer:
              "The sky is an old map, habibi. We read Polaris to find north. The Pleiades mark the seasons. The moon says when to move. Before GPS, before compasses, there were camels, and a grandfather's whisper: when Al-Suhail rises, it's time to travel.",
          },
          {
            keywords: ["majlis", "sitting", "room", "philosophy", "meaning"],
            answer:
              "Majlis means the sitting. It's the room where the ruler hears his people. It's also the floor cushion circle where men talk politics, women talk family. Decisions happen here — not in offices. Still today, the Sheikh holds open majlis weekly. Any citizen can walk in.",
          },
          {
            keywords: ["dubai", "ancient", "new", "modern", "history"],
            answer:
              "Dubai is seventy years young and seven thousand years old, habibi. Pearl divers built this coast. In the '60s there were goat paths where Sheikh Zayed Road runs now. Oil came, then vision. But the old hasn't gone — step off the highway and you'll find the majlis, the souk, the falcon, the dhow.",
          },
          {
            keywords: ["time", "patience", "hurry", "slow"],
            answer:
              "Time, habibi. In the desert, hurrying burns water. You learn to move with the sun, not against it. Even in this city of shining towers — watch the Emiratis. They are calm. Khalas, we say. It's enough.",
          },
          {
            keywords: ["falcon", "hunting", "desert", "bird"],
            answer:
              "The saker falcon is our bird. Six hundred km/h dive. A good falcon takes two years to train — you sleep beside her, feed from your hand. Hunting with falcons is an Emirati inheritance, not a sport. UNESCO listed it. Walla, my grandfather had seven birds.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 3000,
        cityVolumeDuck: 0.2,
        indoor: false,
      },
    },
    {
      id: "dxb_marina_promenade",
      districtId: "dxb-marina",
      kind: "promenade",
      name: "Marina Promenade",
      emoji: "🚤",
      blurb: "7 km of glass towers, yachts, and pastel sunsets. Designed to awe.",
      likeness: "public-landmark",
      location: {
        lat: 25.080158,
        lon: 55.140694,
      },
      placement: "approximate",
      radiusM: 10,
      menu: [],
      facts: [
        {
          text: "Dubai Marina is a canal city carved along 3 km of the Gulf shoreline.",
          status: "corrected",
          note: "Dropped an unsourced superlative. Length unverified.",
        },
        {
          text: "Cayan Tower twists a full 90° from base to crown.",
          status: "corrected",
          note: "Dropped an unsourced 'average tower height'.",
        },
        {
          text: "A full lap of the Marina Walk is about 7 km.",
          status: "corrected",
          note: "Dropped the unverified access rule.",
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
      id: "layla_dxb",
      name: "Layla",
      homePlaceId: "dxb_gold_souk",
      role: "host",
      bio: "Gold Souk merchant. Never in a rush.",
      persona:
        "You are a Gulf-English merchant in the Gold Souk — generous, witty, patient. Use 'habibi', 'yallah', 'walla', 'special price for you'. Lean on the rarity of pieces. Offer coffee before the answer.",
      expertise: ["gold-trading", "karat-testing", "gulf-arabic", "gulf-hospitality"],
      routine: "market",
      lines: [
        "Ahlan habibi — 22 carat today, yes?",
        "Walla, special price for you only.",
        "Coffee first, then we talk gold.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-adult",
        presentation: "feminine",
        ageBand: "adult",
        attire: "black abaya, patterned shayla, gold bangles",
      },
    },
    {
      id: "omar_dxb",
      name: "Omar",
      homePlaceId: "dxb_desert_majlis",
      role: "host",
      bio: "Majlis host. Stars, patience, stories.",
      persona:
        "You are a philosophical Emirati host. Unhurried, speaks of stars, patience, family, time. Offer coffee before every answer. Use 'habibi', 'inshallah', soft silences.",
      expertise: [
        "bedouin-lore",
        "gulf-hospitality",
        "stars-navigation",
        "arabic-coffee",
        "philosophy",
      ],
      routine: "majlis",
      lines: [
        "Marhaba. Sit, sit. Gahwa?",
        "Inshallah we'll talk about the stars.",
        "Slow, habibi — time doesn't hurry here.",
      ],
      canned: [],
      look: {
        avatarId: "body-m-senior",
        presentation: "masculine",
        ageBand: "senior",
        attire: "white kandura and ghutra, grey beard",
      },
    },
    {
      id: "khalid_dxb",
      name: "Khalid",
      homePlaceId: "dxb_gold_souk",
      role: "regular",
      bio: "Gold weigher at the souk. Third-generation karat tester.",
      expertise: ["karat-testing", "gold-trading", "gulf-arabic"],
      routine: "market",
      lines: [
        "Bring it to the scale, habibi. We'll see.",
        "22-carat feels heavier on the thumb. Trust me.",
        "Hallmark is here — small, under the clasp.",
      ],
      canned: [
        {
          keywords: ["karat", "test", "real", "fake", "authentic"],
          answer:
            "Habibi, bring it to the scale and the acid stone. Real 22-karat resists the 18-karat acid. Fake reacts fast, colour changes. Also — density check. Gold is heavy. Plated feels light on the thumb.",
        },
        {
          keywords: ["weight", "scale", "weigh", "grams"],
          answer:
            "Every shop here calibrates at 7am. Accuracy to 0.01 grams, walla. Watch them zero the scale before placing your piece. If they won't — walk. Simple rule.",
        },
        {
          keywords: ["hallmark", "stamp", "916", "750"],
          answer:
            "916 means 22-carat (91.6% gold). 750 means 18-carat. Tiny stamp — clasp or inner band. Dubai Central Lab inspects Souk shops twice a year. Legit piece has it. No stamp, question it.",
        },
      ],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "middle-aged",
        attire: "white kandura, jeweller's loupe on a cord",
      },
    },
    {
      id: "aisha_dxb",
      name: "Aisha",
      homePlaceId: "dxb_desert_majlis",
      role: "regular",
      bio: "Oud player, Emirati poet. Knows every majlis song.",
      expertise: ["oud", "poetry", "gulf-hospitality", "arabic-coffee"],
      routine: "majlis",
      lines: [
        "Marhaba — ek ghazal sunu?",
        "The oud wants a quiet audience, habibi.",
        "Coffee and poetry — the only two that take time.",
      ],
      canned: [
        {
          keywords: ["oud", "instrument", "play", "music"],
          answer:
            "The oud has no frets, habibi — the notes are yours to find. Eleven or thirteen strings, paired. Two years to learn a simple taqsim. But one right note at sunset in the majlis — the whole room breathes together.",
        },
        {
          keywords: ["poetry", "poem", "ghazal", "arabic"],
          answer:
            "Emirati poetry is nabati — the spoken-word tradition. Rulers recite it to each other. Short lines, big meaning. My favourite theme: patience. We have a word, 'sabr' — the English 'patience' is only half of it.",
        },
        {
          keywords: ["music", "majlis", "song", "sing"],
          answer:
            "In a majlis, music is never background. Someone sings, everyone listens. Clap with the palm hollow, not flat — deeper sound. No phones. We don't record the oud, habibi. We remember it.",
        },
      ],
      look: {
        avatarId: "body-f-young",
        presentation: "feminine",
        ageBand: "young-adult",
        attire: "black abaya and simple shayla, oud case",
      },
    },
  ],
  foods: [
    {
      id: "shawarma",
      name: "Shawarma",
      emoji: "🌯",
      price: 15,
      description: "Rotisserie chicken or beef, garlic sauce, pickles, in a soft wrap.",
    },
    {
      id: "luqaimat",
      name: "Luqaimat",
      emoji: "🍩",
      price: 8,
      description: "Crispy dough balls soaked in date syrup — small bites of sugar.",
    },
    {
      id: "arabic-coffee",
      name: "Arabic Coffee + Dates",
      emoji: "☕",
      price: 6,
      description: "Cardamom-spiced gahwa with khalas dates.",
    },
    {
      id: "camel-milk-chocolate",
      name: "Camel-Milk Chocolate",
      emoji: "🍫",
      price: 10,
      description: "Only-in-the-Gulf treat — creamy and slightly tangy.",
    },
  ],
  events: [
    {
      id: "dxb_majlis_poetry",
      placeId: "dxb_desert_majlis",
      title: "Thursday Oud & Poetry",
      blurb: "Aisha plays. Omar pours gahwa. Bring a question, leave with a verse.",
      emoji: "🎵",
      schedule: {
        dayOfWeek: 4,
        startHour: 20,
        durationHours: 3,
      },
    },
  ],
});
