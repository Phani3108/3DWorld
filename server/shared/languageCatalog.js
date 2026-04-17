/**
 * Language catalog — per-city dialect, greeting, filler words, agent style.
 * Pure data. The client reads this for the LanguageBadge + city greeting on
 * join; the Ask-an-Agent flow passes `agentStylePrompt` to bots so their
 * answers feel native.
 *
 * Adding a language = add one entry. No logic changes.
 */

export const LANGUAGES = {
  hyderabad: {
    id: "hy",
    cityId: "hyderabad",
    name: "Hyderabadi Urdu + Telugu",
    script: "हैदराबादी اُردو + తెలుగు",
    greetings: [
      "Aadab sahab!",
      "Namaskaram!",
      "Kaisa hai bhai, bagunnara?",
      "Welcome bhai — chai pee lo.",
    ],
    filler: ["kaiku", "bolo", "kya", "haan bhai", "baigan", "emaindi", "sahi", "haula"],
    farewell: ["Khuda hafiz", "Alvida", "Velthaanu", "Chalo bhai, milte hain"],
    glossary: {
      kaiku: "why (Hyderabadi Urdu)",
      bolo: "tell me / go on",
      baigan: "literally eggplant, used as 'weird' or 'yikes'",
      haula: "silly / crazy (affectionate)",
      emaindi: "what happened? (Telugu)",
      "khuda hafiz": "goodbye (Urdu, lit. 'God protect')",
    },
    agentStylePrompt:
      "Write in Hyderabadi Urdu sprinkled with Telugu words. Use 'kaiku', 'bolo', 'haan bhai', 'aadab', 'khuda hafiz' naturally. Warm, teasing, slightly dramatic. Don't translate every phrase — let the mood carry.",
  },

  dubai: {
    id: "ar",
    cityId: "dubai",
    name: "Gulf English + Arabic",
    script: "خليجي English + عربي",
    greetings: [
      "Ahlan wa sahlan!",
      "Marhaba habibi, welcome.",
      "Salaam! Kaif halak?",
      "Ahlan! Chai or gahwa first?",
    ],
    filler: ["habibi", "yallah", "inshallah", "mashallah", "khalas", "walla"],
    farewell: ["Ma'a salama", "Allah ma'ak", "Yallah bye"],
    glossary: {
      habibi: "my friend / my love (warm)",
      yallah: "let's go / c'mon",
      inshallah: "God willing",
      mashallah: "wonderful / as God willed",
      khalas: "enough / done",
      walla: "I swear / really",
    },
    agentStylePrompt:
      "Speak warm Gulf English with Arabic sprinkles. Use 'habibi', 'yallah', 'inshallah', 'mashallah'. Generous, slightly effusive host energy. Offer tea or coffee before the answer.",
  },

  bengaluru: {
    id: "kn",
    cityId: "bengaluru",
    name: "Kannada + English",
    script: "ಕನ್ನಡ + English",
    greetings: [
      "Namaskara!",
      "Hello maga, chennagidira?",
      "Hi! Traffic hogi beko illiyo?",
      "Eshtu chennaagide, welcome.",
    ],
    filler: ["maga", "swalpa", "anna", "chennagide", "saar", "macha"],
    farewell: ["Sigona maga", "Bye bye", "Take care macha"],
    glossary: {
      maga: "dude / bro (casual Bengaluru-English)",
      swalpa: "a little (Kannada)",
      anna: "older brother / sir (Kannada)",
      chennagide: "that's nice (Kannada)",
      macha: "buddy (South-Indian affectionate)",
    },
    agentStylePrompt:
      "Casual Bengaluru English with Kannada sprinkled in. 'Maga', 'swalpa adjust maadi', 'chennagide'. Techie-chill, slightly rueful about traffic and rents. Garden-city calm.",
  },

  mumbai: {
    id: "hi-mr",
    cityId: "mumbai",
    name: "Bombay Hindi + Marathi + English",
    script: "हिंदी + मराठी + English",
    greetings: [
      "Aye bhai! Kya scene hai?",
      "Namaskar! Kay chalu ahe?",
      "Hello hello! Pao bhaji khana hai?",
      "Bindaas yaar, welcome!",
    ],
    filler: ["bindaas", "tapori", "ekdum", "jhakaas", "kay", "chalu", "fatafat", "mast"],
    farewell: ["Chal bhai, milte hain", "Tata", "Bye-bye, safely jaa"],
    glossary: {
      bindaas: "chill / carefree (Bombay slang)",
      tapori: "street-smart / slightly rowdy affection",
      ekdum: "totally / absolutely",
      jhakaas: "fantastic (classic Amitabh)",
      kay: "what (Marathi)",
      "chalu ahe": "what's going on (Marathi)",
      mast: "awesome",
    },
    agentStylePrompt:
      "Bombay Hindi mixed with Marathi and English. Use 'bindaas', 'ekdum jhakaas', 'kya scene hai', 'tapori'. Fast, warm, street-smart. Drop the odd 'kay chalu ahe' for flavour.",
  },

  newyork: {
    id: "en-us-ny",
    cityId: "newyork",
    name: "New York English",
    script: "NYC slang",
    greetings: [
      "Yo! How ya doin'?",
      "Hey hey, welcome to the city.",
      "What's up, pal?",
      "Howzit — grab a slice?",
    ],
    filler: ["deadass", "no cap", "bodega", "trynna", "lowkey", "mad", "kid", "wildin'"],
    farewell: ["Catch ya later", "Peace", "See ya, pal", "Take it easy"],
    glossary: {
      deadass: "seriously / I mean it",
      "no cap": "no lie / truly",
      bodega: "corner store",
      trynna: "trying to",
      lowkey: "subtly / kinda",
      mad: "very (intensifier)",
      wildin: "acting wild / outrageous",
    },
    agentStylePrompt:
      "New York slang. Use 'deadass', 'no cap', 'bodega', 'trynna', 'lowkey', 'mad good'. Direct, wry, a little fast. No filler pleasantries — get to the point.",
  },

  singapore: {
    id: "en-sg",
    cityId: "singapore",
    name: "Singlish",
    script: "Singlish",
    greetings: [
      "Hello hello!",
      "Eh, you come already ah?",
      "Aiyoh, welcome lah.",
      "Wah shiok weather today hor?",
    ],
    filler: ["lah", "leh", "lor", "hor", "sia", "aiyoh", "shiok", "chope", "can can"],
    farewell: ["Bye lah", "See you ah", "Take care lor"],
    glossary: {
      lah: "emphasis particle",
      leh: "soft emphasis / questioning",
      lor: "acceptance / resignation",
      hor: "agreement tag",
      aiyoh: "oh no / oh dear",
      shiok: "extremely satisfying",
      chope: "to reserve / save a seat",
    },
    agentStylePrompt:
      "Singlish. End sentences with 'lah', 'leh', 'lor' appropriately. Use 'shiok' for good things, 'aiyoh' for surprise, 'can can' for 'sure'. Polite, playful, efficient.",
  },

  sydney: {
    id: "en-au",
    cityId: "sydney",
    name: "Australian English",
    script: "Aussie English",
    greetings: [
      "G'day mate!",
      "How ya going?",
      "Cheers, welcome to the harbour.",
      "Ow ya travellin'?",
    ],
    filler: ["mate", "reckon", "heaps", "no worries", "arvo", "servo", "chockers", "bloody"],
    farewell: ["Cheers mate", "Catch ya", "Hooroo", "Take it easy"],
    glossary: {
      mate: "friend (universal)",
      reckon: "think / guess",
      heaps: "lots",
      arvo: "afternoon",
      servo: "gas station",
      chockers: "completely full",
      hooroo: "goodbye (old-school)",
    },
    agentStylePrompt:
      "Aussie English. Use 'mate', 'reckon', 'heaps', 'arvo', 'servo', 'no worries'. Relaxed, self-deprecating, short sentences. End with a friendly 'ey?' every now and then.",
  },
};

/** @returns {object|null} */
export const getLanguage = (cityId) => LANGUAGES[cityId] || null;

/** @returns {string} random greeting for a given city */
export const pickGreeting = (cityId) => {
  const lang = LANGUAGES[cityId];
  if (!lang) return "Welcome!";
  return lang.greetings[Math.floor(Math.random() * lang.greetings.length)];
};

/** Public-safe projection (identical to the source for now — no secrets). */
export const publicLanguage = (cityId) => {
  const lang = LANGUAGES[cityId];
  if (!lang) return null;
  return { ...lang };
};
