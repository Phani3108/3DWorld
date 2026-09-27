import { defineCity } from "../schema.ts";

export default defineCity({
  city: {
    id: "bengaluru",
    name: "Bengaluru",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    emoji: "🌳",
    tagline: "Garden City — filter coffee, pubs, rain and a lot of code",
    palette: {
      sky: "#bbf7d0",
      ground: "#7ba35f",
      accent: "#dc2626",
    },
    center: {
      lat: 12.9716,
      lon: 77.5946,
    },
    greeterId: "arjun_blr",
    defaultDistrictId: "blr-central",
    emotes: ["namaste", "think"],
    facts: [
      {
        text: "Bengaluru is called the Silicon Valley of India — home to 40%+ of India's IT exports.",
      },
      {
        text: "Cubbon Park covers 300 acres and has over 6,000 trees.",
      },
      {
        text: "South Indian filter coffee drips through a two-part metal filter, then gets poured between a davara and tumbler to cool and froth it.",
        status: "corrected",
        note: "Legacy text said the coffee is brewed in the davara-tumbler; brewing happens in the filter.",
      },
    ],
    language: {
      name: "Kannada + English",
      script: "ಕನ್ನಡ + English",
      greetings: [
        "Namaskara!",
        "Hello maga, chennagidira?",
        "Hi! Traffic hogi beko illiyo?",
        "Eshtu chennaagide, welcome.",
      ],
      filler: ["maga", "swalpa", "anna", "chennagide", "saar", "macha"],
      farewells: ["Sigona maga", "Bye bye", "Take care macha"],
      glossary: {
        maga: "dude / bro (casual Bengaluru-English)",
        swalpa: "a little (Kannada)",
        anna: "older brother / sir (Kannada)",
        chennagide: "that's nice (Kannada)",
        macha: "buddy (South-Indian affectionate)",
      },
      style:
        "Casual Bengaluru English with Kannada sprinkled in. 'Maga', 'swalpa adjust maadi', 'chennagide'. Techie-chill, slightly rueful about traffic and rents. Garden-city calm.",
    },
  },
  districts: [
    {
      id: "blr-central",
      name: "Central · Cubbon Park",
      blurb: "Cubbon Park's canopy and the pubs and bookshops of Church Street.",
      origin: {
        lat: 12.9757,
        lon: 77.5985,
      },
      radiusM: 900,
      spawn: {
        lat: 12.9757,
        lon: 77.5985,
      },
      attribution: ["© OpenStreetMap contributors (ODbL)"],
    },
  ],
  places: [
    {
      id: "blr_mtr",
      districtId: "blr-central",
      kind: "restaurant",
      name: "MTR (Mavalli Tiffin Room)",
      emoji: "🥞",
      blurb: "Since 1924. Masala dosa, rava idli (they invented it), filter coffee.",
      likeness: "real-business",
      location: {
        lat: 12.9745,
        lon: 77.6,
      },
      placement: "relocated",
      radiusM: 12,
      hostId: "arjun_blr",
      menu: ["masala-dosa", "filter-coffee", "bisi-bele-bath"],
      facts: [
        {
          text: "MTR invented rava idli during WWII when rice was rationed.",
        },
        {
          text: "The 'Mavalli' in the name refers to the Bengaluru locality of its first shop.",
        },
        {
          text: "Filter coffee here is served in a dabarah-tumbler so you can pour-mix for the perfect temperature.",
        },
      ],
      conversation: {
        greeting: "Namaskara! Dosa ready in five, filter coffee now now.",
        seeds: [
          "How do I drink filter coffee properly?",
          "Who invented rava idli?",
          "Why is dosa always paired with coconut chutney?",
          "Why is Bengaluru called the Silicon Valley of India?",
        ],
        register: "warm-traditional-kannada-english",
        canned: [
          {
            keywords: ["filter", "coffee", "how", "drink", "properly", "dabarah"],
            answer:
              "Saar — see the two vessels? Tumbler and dabarah. Coffee comes almost boiling in the tumbler. Pour into the dabarah to cool. Pour back to mix froth. Two or three times. Drink from the tumbler without lips touching — hygienic. Three sips, no hurry.",
          },
          {
            keywords: ["rava", "idli", "invent", "history", "who"],
            answer:
              "Rava idli was born here, saar — during World War Two. Rice was rationed, but semolina was available. We tried steaming a semolina-buttermilk batter with cashews and mustard. Guests loved it. Seventy years later, every tiffin room makes it. Small innovation, big legacy.",
          },
          {
            keywords: ["dosa", "chutney", "coconut", "pair", "why"],
            answer:
              "Chennagide question, saar. Dosa is made of rice and urad dal — heating, filling. Coconut chutney is cool, fatty, balancing. Sambar adds tang. The three together — hot, cool, sour — that's a complete bite in Karnataka. South Indian food is always a triangle.",
          },
          {
            keywords: ["bengaluru", "silicon", "valley", "tech", "it"],
            answer:
              "It started in the '80s, saar. Indian Institute of Science was here. IIT Madras, IIIT. Texas Instruments opened the first foreign office in 1985. Infosys followed, Wipro, TCS. Weather was cool, educated people, cheap rent. Now 40% of India's IT exports. But the traffic, saar — the price of that success.",
          },
          {
            keywords: ["bisi", "bele", "bath", "dish", "what"],
            answer:
              "Bisi means hot, bele means lentil, bath means cooked rice. One-pot, tangy with tamarind, spiced with a roasted masala, loaded with ghee. Karnataka's comfort food. Any Kannadiga in Bengaluru who's homesick — this is the cure.",
          },
          {
            keywords: ["kannada", "teach", "phrase", "word"],
            answer:
              "Swalpa Kannada — little bit, I'll teach. 'Namaskara' is hello. 'Chennagide' is nice. 'Swalpa adjust maadi' — please adjust a little (you'll hear this on every bus). 'Ennu beku' — what would you like? Try it next time with an auto driver, he'll smile.",
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
      id: "blr_church_street_pub",
      districtId: "blr-central",
      kind: "bar",
      name: "Church Street Pub",
      emoji: "🍺",
      blurb: "Indie bands, craft beer, weekend crowds. The heart of Bengaluru's going-out.",
      likeness: "generic",
      location: {
        lat: 12.9752,
        lon: 77.6045,
      },
      placement: "approximate",
      radiusM: 10,
      hostId: "divya_blr",
      menu: ["mysore-pak"],
      facts: [
        {
          text: "Bengaluru had more breweries than any other Indian city by the 2010s.",
        },
        {
          text: "Church Street was renamed but locals still use the old name — tradition beats the signage.",
        },
        {
          text: "The city's indie music scene runs through here: Thermal and a Quarter, Raghu Dixit, Swarathma.",
        },
      ],
      conversation: {
        greeting: "Hey hey — surviving the traffic? What are you drinking?",
        seeds: [
          "What's Bengaluru's indie music scene like?",
          "Why are there so many pubs here?",
          "What do you think of the tech boom?",
          "Which craft breweries should I know?",
        ],
        register: "casual-ironic-bengaluru-english",
        canned: [
          {
            keywords: ["indie", "music", "bands", "scene", "local"],
            answer:
              "Bangalore's indie scene is genuinely the best in India, maga. Thermal and a Quarter, Raghu Dixit, Swarathma, Peter Cat Recording Co. when they visit. Fifteen-odd mid-size venues. Tickets are cheap because the rent was cheap — was. Still cheaper than Bombay.",
          },
          {
            keywords: ["pubs", "breweries", "why", "many", "alcohol"],
            answer:
              "Cold weather. Big tech population with disposable income. State regulations that favoured microbreweries. In 2012-2015 we had a boom — every other block opened a pub. It's thinned out since, but Church Street and Indiranagar still compete for the title.",
          },
          {
            keywords: ["tech", "boom", "industry", "think", "culture"],
            answer:
              "Swalpa complicated. The tech boom built the schools, the hospitals, the cafés, the pubs. It also built the traffic that kills three hours of your day. Rent tripled. The old Bangalore — pensioners, temples, parks — still exists but you have to look for it. Trade-off, maga.",
          },
          {
            keywords: ["craft", "brewery", "beer", "recommend"],
            answer:
              "Toit, Arbor, Byg Brewski, Geist. Toit for classic IPAs, Arbor for experimental stuff, Byg Brewski for the giant venue vibe, Geist for German styles. All within autorickshaw range of here. Chennagide scene, really.",
          },
          {
            keywords: ["traffic", "commute", "bangalore", "bad"],
            answer:
              "Legendary. Fifteen km in ninety minutes on a Tuesday. Metro has helped — Namma Metro is actually great — but roads are full. Rule number one: never drive for lunch. Rule two: always leave 30 minutes earlier than Google says.",
          },
          {
            keywords: ["church", "street", "name", "history", "renamed"],
            answer:
              "Technically it's 'Mahatma Gandhi Road extension' on official maps. Locals never switched. Church Street came from the St. Mark's Cathedral nearby. Bangalore does that — the old name survives the bureaucracy.",
          },
        ],
      },
      ambience: {
        crossfadeMs: 2000,
        cityVolumeDuck: 0.3,
        indoor: true,
      },
    },
    {
      id: "blr_cubbon_park",
      districtId: "blr-central",
      kind: "park",
      name: "Cubbon Park",
      emoji: "🌳",
      blurb: "300 acres of green in the middle of the city. Sunday is for cyclists.",
      likeness: "public-landmark",
      location: {
        lat: 12.9763,
        lon: 77.5929,
      },
      placement: "approximate",
      radiusM: 12,
      menu: [],
      facts: [
        {
          text: "Laid out in 1870, the park was later named after Sir Mark Cubbon.",
          status: "corrected",
          note: "Original name (Meade's Park) and today's area are unverified.",
        },
        {
          text: "Every Sunday the main road closes for cyclists and skaters.",
        },
        {
          text: "Home to 6,000+ trees and Bangalore's oldest library.",
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
      id: "arjun_blr",
      name: "Arjun",
      homePlaceId: "blr_mtr",
      role: "host",
      bio: "MTR floor captain. Filter coffee evangelist.",
      persona:
        "You are a traditional gracious host at MTR. Mix Kannada and English politely. 'Dosa beku saar?' 'Swalpa tuppa haaktheeni.' Teach the filter-coffee ritual on request. Quiet pride in tradition.",
      expertise: ["filter-coffee", "south-indian", "kannada", "story-telling"],
      routine: "host",
      lines: [
        "Namaskara! Dosa ready in five.",
        "Saar — filter coffee properly pour maadi.",
        "Rava idli was born here, dikra.",
      ],
      canned: [],
      look: {
        avatarId: "body-m-adult",
        presentation: "masculine",
        ageBand: "adult",
        attire: "crisp white shirt, dark trousers, towel over one shoulder",
      },
    },
    {
      id: "divya_blr",
      name: "Divya",
      homePlaceId: "blr_church_street_pub",
      role: "host",
      bio: "Weekend bartender. Indie music nerd.",
      persona:
        "You are a weekend Bengaluru pub owner — cynical about traffic, warm about music, ironic about tech bros. Casual Bengaluru English with Kannada sprinkles. Light sarcasm.",
      expertise: ["indie-music", "craft-beer", "tech-bengaluru", "kannada"],
      routine: "pub",
      lines: [
        "Hey maga, surviving the traffic?",
        "Toit or Arbor — take a pick.",
        "Thermal and a Quarter playing Friday, come.",
      ],
      canned: [],
      look: {
        avatarId: "body-f-young",
        presentation: "feminine",
        ageBand: "young-adult",
        attire: "band T-shirt and denim apron",
      },
    },
    {
      id: "ravi_blr",
      name: "Ravi",
      homePlaceId: "blr_mtr",
      role: "regular",
      bio: "Morning regular at MTR. Filter coffee decanter, tiffin scholar.",
      expertise: ["filter-coffee", "south-indian", "kannada", "story-telling"],
      routine: "chat_stall",
      lines: [
        "Saar — decoction ratio matters more than beans.",
        "Rava idli vs dosa — dosa, everyday.",
        "Kannada swalpa seeko — beku means want.",
      ],
      canned: [
        {
          keywords: ["filter", "coffee", "decoction", "ratio"],
          answer:
            "Decoction ratio is 1:4 — one spoon coffee powder, four spoons water. Percolator fifteen minutes. Mix with milk 1:1 at serving. Saar — Chikmagalur beans, dark roast, chicory 20%. That's the MTR way.",
        },
        {
          keywords: ["tiffin", "breakfast", "south", "dosa", "idli"],
          answer:
            "Tiffin — that's the morning meal in Karnataka. Dosa, idli, vada, uppittu, khara bath — all tiffin. Not snack. Not lunch. Tiffin. Rava idli was born in this very building, saar. War time, rice rationed.",
        },
        {
          keywords: ["kannada", "teach", "phrase", "bengaluru"],
          answer:
            "Swalpa Kannada — namaskara is hello, beku is want, bekilla is don't want. 'Swalpa adjust maadi' you'll hear on every bus — please adjust a little. Auto driver se 'meter hogi' bolo — meter on, chalo.",
        },
      ],
      look: {
        avatarId: "body-m-senior",
        presentation: "masculine",
        ageBand: "senior",
        attire: "half-sleeve shirt and veshti, newspaper under the arm",
      },
    },
    {
      id: "anu_blr",
      name: "Anu",
      homePlaceId: "blr_church_street_pub",
      role: "regular",
      bio: "Indie drummer. Gigs on weekends, codes on weekdays.",
      expertise: ["indie-music", "craft-beer", "tech-bengaluru"],
      routine: "pub",
      lines: [
        "Thermal set-list tonight, maga.",
        "This IPA has too much citrus — who did this.",
        "Reviewing a PR between two beers. Perks.",
      ],
      canned: [
        {
          keywords: ["indie", "band", "gig", "music", "play"],
          answer:
            "Bangalore indie scene is genuinely the best, maga. Thermal and a Quarter, Peter Cat, Swarathma. Small venues, tight crowds, ticket's 400 bucks, beer's 300. Friday's my gig day, Saturday I'm wrecked.",
        },
        {
          keywords: ["ipa", "beer", "recommend", "craft"],
          answer:
            "Too much grapefruit is a hipster crime. I want malt backbone. Toit's Basmati Blonde is underrated. Arbor does a solid stout. Geist German styles are clean. Byg Brewski — go for the view, stay for the pork.",
        },
        {
          keywords: ["tech", "pull request", "code", "engineer"],
          answer:
            "Reviewing PRs between beers is a Bangalore lifestyle, not a joke. Morning standup, afternoon ticket, evening gig, night code-push. My laptop knows the Church Street WiFi better than home.",
        },
      ],
      look: {
        avatarId: "body-f-young",
        presentation: "feminine",
        ageBand: "young-adult",
        attire: "oversized hoodie, drumsticks in the back pocket",
      },
    },
  ],
  foods: [
    {
      id: "masala-dosa",
      name: "Masala Dosa",
      emoji: "🥞",
      price: 15,
      description: "Crispy rice-lentil crepe wrapped around spiced potato.",
    },
    {
      id: "filter-coffee",
      name: "Filter Coffee",
      emoji: "☕",
      price: 8,
      description: "Decoction + boiled milk served in a dabarah-tumbler.",
    },
    {
      id: "mysore-pak",
      name: "Mysore Pak",
      emoji: "🍬",
      price: 6,
      description: "Ghee-soaked besan fudge, square-cut and dense.",
    },
    {
      id: "bisi-bele-bath",
      name: "Bisi Bele Bath",
      emoji: "🍲",
      price: 18,
      description: "Rice, lentils, tamarind, ghee — one-pot warmth.",
    },
  ],
  events: [
    {
      id: "blr_indie_friday",
      placeId: "blr_church_street_pub",
      title: "Friday Indie Set",
      blurb: "Anu opens. Thermal headlines. Toit on tap till midnight.",
      emoji: "🎸",
      schedule: {
        dayOfWeek: 5,
        startHour: 21,
        durationHours: 4,
      },
    },
    {
      id: "blr_filter_morning",
      placeId: "blr_mtr",
      title: "Saturday Filter-Coffee Tasting",
      blurb: "Ravi runs three decoctions side-by-side. Free upgrade if you guess the bean origin.",
      emoji: "☕",
      schedule: {
        dayOfWeek: 6,
        startHour: 8,
        durationHours: 3,
      },
    },
  ],
});
