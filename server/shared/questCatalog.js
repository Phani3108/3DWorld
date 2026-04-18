/**
 * Quest catalog — Phase 9A.
 *
 * Each host resident offers a short, themed quest. Quests are simple:
 *   • `goal.type`  — what action completes it
 *       - "ask_tag"      → ask anyone about expertise tag X
 *       - "ask_resident" → ask a specific resident any question
 *       - "visit_venue"  → enter a venue
 *       - "buy_item"     → buy a specific bazaar item
 *       - "trade_bundle" → redeem a specific barter bundle
 *   • `goal.target` — the id needed to match
 *   • `goal.count`  — how many occurrences (defaults to 1)
 *
 * Completion rewards: coins + XP + reputation bump in the giver's city.
 *
 * Kept to one-quest-per-host for the demo (14 total). Regulars don't
 * offer quests — they're the flavour layer; quests are deliberate.
 */

export const QUESTS = {
  // ═══ Hyderabad ════════════════════════════════════════════════════
  farah_biryani_mission: {
    id: "farah_biryani_mission", giverId: "farah_hyd",
    title: "Understand Dum Biryani",
    blurb: "Learn what makes Hyderabadi biryani special from someone who knows.",
    goal: { type: "ask_tag", target: "dum-cooking", count: 1 },
    reward: { coins: 30, xp: 20, reputation: 10 },
  },
  asad_irani_mission: {
    id: "asad_irani_mission", giverId: "asad_hyd",
    title: "Try Irani Chai",
    blurb: "Walk into Niloufer Café and chat with the locals.",
    goal: { type: "visit_venue", target: "hyd_niloufer_cafe", count: 1 },
    reward: { coins: 10, xp: 10, reputation: 5 },
  },

  // ═══ Dubai ════════════════════════════════════════════════════════
  layla_gold_mission: {
    id: "layla_gold_mission", giverId: "layla_dxb",
    title: "Haggle Like a Local",
    blurb: "Ask someone about bargaining in the Gold Souk.",
    goal: { type: "ask_tag", target: "gold-trading", count: 1 },
    reward: { coins: 25, xp: 20, reputation: 10 },
  },
  omar_majlis_mission: {
    id: "omar_majlis_mission", giverId: "omar_dxb",
    title: "Sit in the Majlis",
    blurb: "Share coffee in the Desert Majlis. Talk about hospitality.",
    goal: { type: "ask_tag", target: "gulf-hospitality", count: 1 },
    reward: { coins: 25, xp: 20, reputation: 10 },
  },

  // ═══ Bengaluru ════════════════════════════════════════════════════
  arjun_filter_mission: {
    id: "arjun_filter_mission", giverId: "arjun_blr",
    title: "The Right Way to Drink Coffee",
    blurb: "Learn the tumbler-dabarah ritual at MTR.",
    goal: { type: "ask_tag", target: "filter-coffee", count: 1 },
    reward: { coins: 20, xp: 15, reputation: 8 },
  },
  divya_indie_mission: {
    id: "divya_indie_mission", giverId: "divya_blr",
    title: "Bangalore's Indie Scene",
    blurb: "Chat with someone who knows the local music.",
    goal: { type: "ask_tag", target: "indie-music", count: 1 },
    reward: { coins: 20, xp: 15, reputation: 8 },
  },

  // ═══ Mumbai ═══════════════════════════════════════════════════════
  priya_parsi_mission: {
    id: "priya_parsi_mission", giverId: "priya_mum",
    title: "Taste of Britannia",
    blurb: "Ask about Parsi cuisine — there's a lot of history in it.",
    goal: { type: "ask_tag", target: "parsi-cuisine", count: 1 },
    reward: { coins: 25, xp: 20, reputation: 10 },
  },
  rohan_street_mission: {
    id: "rohan_street_mission", giverId: "rohan_mum",
    title: "Fatafat Street Food",
    blurb: "Learn Mumbai's street-food slang — 'bindaas', 'jhakaas', 'tapori'.",
    goal: { type: "ask_tag", target: "bombay-tapori", count: 1 },
    reward: { coins: 18, xp: 15, reputation: 8 },
  },

  // ═══ New York ══════════════════════════════════════════════════════
  marcus_pastrami_mission: {
    id: "marcus_pastrami_mission", giverId: "marcus_nyc",
    title: "Pastrami 101",
    blurb: "Ask about how Katz's does pastrami differently.",
    goal: { type: "ask_tag", target: "pastrami", count: 1 },
    reward: { coins: 25, xp: 20, reputation: 10 },
  },
  sasha_bodega_mission: {
    id: "sasha_bodega_mission", giverId: "sasha_nyc",
    title: "Order Like a Local",
    blurb: "Learn how to order a bacon-egg-and-cheese the NYC way.",
    goal: { type: "ask_tag", target: "bodega-culture", count: 1 },
    reward: { coins: 18, xp: 15, reputation: 8 },
  },

  // ═══ Singapore ════════════════════════════════════════════════════
  mei_hawker_mission: {
    id: "mei_hawker_mission", giverId: "mei_sg",
    title: "Navigate the Hawker Centre",
    blurb: "Ask an aunty about 'chope' culture before you try it yourself.",
    goal: { type: "ask_tag", target: "chope-culture", count: 1 },
    reward: { coins: 20, xp: 15, reputation: 8 },
  },
  lim_kopi_mission: {
    id: "lim_kopi_mission", giverId: "uncle_lim_sg",
    title: "Crack the Kopi Code",
    blurb: "Learn how to order coffee the old-school Singapore way.",
    goal: { type: "ask_tag", target: "kopi-codes", count: 1 },
    reward: { coins: 20, xp: 15, reputation: 8 },
  },

  // ═══ Sydney ════════════════════════════════════════════════════════
  jack_bondi_mission: {
    id: "jack_bondi_mission", giverId: "jack_syd",
    title: "First Day at Bondi",
    blurb: "Ask about Bondi surf culture before you paddle out.",
    goal: { type: "ask_tag", target: "bondi-surf", count: 1 },
    reward: { coins: 22, xp: 18, reputation: 10 },
  },
  nat_flat_white_mission: {
    id: "nat_flat_white_mission", giverId: "nat_syd",
    title: "Flat White 101",
    blurb: "Ask a Sydney barista what a proper flat white really is.",
    goal: { type: "ask_tag", target: "flat-white", count: 1 },
    reward: { coins: 22, xp: 18, reputation: 10 },
  },
};

export const listQuestIds = () => Object.keys(QUESTS);
export const getQuest = (id) => QUESTS[id] || null;
export const questsByGiver = (giverId) =>
  Object.values(QUESTS).filter((q) => q.giverId === giverId);
export const allQuestsPublic = () => Object.values(QUESTS);

/**
 * Check whether an event should tick progress on a quest.
 * Returns the matched amount (count) or 0.
 */
export const matchEvent = (quest, event) => {
  if (!quest || !event) return 0;
  const g = quest.goal;
  if (!g || g.type !== event.type) return 0;
  if (g.target !== event.target) return 0;
  return 1;
};
