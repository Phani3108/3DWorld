/**
 * Resident personal Q&A — Phase 7E.4.
 *
 * Each regular resident can answer from their own short bank, in their
 * own voice, *before* the Ask handler falls through to the venue-level
 * canned bank. This lets a single venue carry two distinct conversations
 * (host vs regular) without adding complexity to the matcher.
 *
 * Shape: residentId → Array<{ keywords: string[], answer: string }>
 *
 * Schema intentionally matches `venue.conversation.cannedAnswers` so we
 * can feed both banks through `matchCannedAnswerIn(bank, question)`.
 *
 * Hosts don't need entries here — the venue bank already represents them.
 */

export const RESIDENT_QA = {
  // ── Hyderabad ─────────────────────────────────────────────────────
  naseem_hyd: [
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
  zara_hyd: [
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

  // ── Dubai ─────────────────────────────────────────────────────────
  khalid_dxb: [
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
  aisha_dxb: [
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

  // ── Bengaluru ─────────────────────────────────────────────────────
  ravi_blr: [
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
  anu_blr: [
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

  // ── Mumbai ────────────────────────────────────────────────────────
  dadi_mum: [
    {
      keywords: ["berry", "pulao", "zereshk", "recipe"],
      answer:
        "Dikra — zereshk comes from Yazd, not 'Iran' generically. We've had the same supplier since 1961. Soak zereshk for ten minutes. Fry in ghee with sugar for three. Scatter on basmati-saffron rice with slivered almond. My grandmother would slap me if I got the ratio wrong.",
    },
    {
      keywords: ["parsi", "history", "zoroastrian", "community"],
      answer:
        "Dikra, Parsis came to Gujarat first, then Bombay when the dockyards opened. My great-grandfather landed at Ballard Estate. Three generations later, we own a restaurant that's older than the country. Think about that.",
    },
    {
      keywords: ["bombay", "old", "changed", "then"],
      answer:
        "In the 60s, Bombay had trams on Dadabhai Naoroji Road. I walked to school in Byculla. Knew the fishmonger, the cobbler, the priest by name. Now — towers everywhere. Juhu sunset still same. Some things Bombay can't spoil.",
    },
  ],
  salman_mum: [
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

  // ── New York ──────────────────────────────────────────────────────
  estelle_nyc: [
    {
      keywords: ["pickle", "brine", "ferment", "sour"],
      answer:
        "Half-sour: two weeks, still crunchy, bright. Full-sour: six weeks, soft, deep. Kosher dill: garlic, dill, salt, water, no vinegar. Vinegar pickles are a crime against the Lower East Side. Fermentation is the whole point.",
    },
    {
      keywords: ["deli", "jewish", "history", "lower", "east"],
      answer:
        "Lower East Side had three hundred kosher delis at the peak, kid. Katz's survived because we didn't modernize. Russ & Daughters stayed because smoked fish doesn't need updating. Most closed — rent, grandkids, real estate. The ones left? Museums you can eat in.",
    },
    {
      keywords: ["orchard", "street", "old", "neighborhood"],
      answer:
        "Orchard Street was pushcarts, not boutiques. Yiddish on every corner. You'd buy eggs from one guy, fabric from another, pickle from my grandfather. Now — a thousand-dollar handbag on the same sidewalk. Same bricks, different city.",
    },
  ],
  reggie_nyc: [
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

  // ── Singapore ─────────────────────────────────────────────────────
  xiao_ming_sg: [
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
  priya_sg: [
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

  // ── Sydney ────────────────────────────────────────────────────────
  maz_syd: [
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
  ari_syd: [
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
};

/**
 * Match a question against a resident's personal Q&A bank.
 * Same scoring approach as venueCatalog.matchCannedAnswer so the two
 * banks feel consistent to the asker.
 *
 * @param {string} residentId
 * @param {string} question
 * @returns {object|null} { keywords, answer } or null
 */
export const matchResidentCannedAnswer = (residentId, question) => {
  const bank = RESIDENT_QA[residentId];
  if (!Array.isArray(bank) || bank.length === 0) return null;
  const q = String(question || "").toLowerCase();
  if (!q) return null;
  const tokens = new Set(q.split(/\W+/).filter((t) => t.length > 2));

  let best = null;
  let bestScore = 0;
  for (const entry of bank) {
    let score = 0;
    for (const kw of entry.keywords || []) {
      const kwLower = kw.toLowerCase();
      if (q.includes(kwLower)) score += 2;
      for (const tok of tokens) {
        if (kwLower.includes(tok) || tok.includes(kwLower)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore > 0 ? best : null;
};

/** @returns {string[]} all resident ids with a personal Q&A bank. */
export const listResidentsWithQA = () => Object.keys(RESIDENT_QA);
