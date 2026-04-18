/**
 * Frontend API helpers — REST wrappers around the 3D World server.
 *
 * All calls go to `import.meta.env.VITE_SERVER_URL || "http://localhost:3000"`.
 * Throws on non-2xx. Callers decide how to render the error.
 */

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const getJSON = async (path) => {
  const res = await fetch(`${SERVER_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
};

const postJSON = async (path, body) => {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${path} → ${res.status} ${text.slice(0, 120)}`);
  }
  return res.json();
};

// ── Catalogs (Phase 1) ──────────────────────────────────────────────
export const fetchCities = () => getJSON("/api/v1/cities");
export const fetchCity = (id) => getJSON(`/api/v1/cities/${encodeURIComponent(id)}`);

export const fetchFoods = () => getJSON("/api/v1/food");
export const fetchFoodsForCity = (cityId) =>
  getJSON(`/api/v1/food/city/${encodeURIComponent(cityId)}`);
export const fetchFood = (id) => getJSON(`/api/v1/food/${encodeURIComponent(id)}`);

export const fetchAvatars = () => getJSON("/api/v1/avatars");
export const fetchAccents = () => getJSON("/api/v1/accents");

// ── Reactions (Phase 1.5) ───────────────────────────────────────────
export const fetchEmojiReactions = () => getJSON("/api/v1/reactions/emojis");
export const fetchMemes = () => getJSON("/api/v1/reactions/memes");

// ── Profiles (Phase 2) ──────────────────────────────────────────────
export const fetchProfile = (userId) =>
  getJSON(`/api/v1/users/${encodeURIComponent(userId)}/profile`);

export const updateProfile = (userId, patch) =>
  postJSON(`/api/v1/users/${encodeURIComponent(userId)}/profile`, patch);

// ── Food (Phase 4) ──────────────────────────────────────────────────
export const buyFood = (userId, foodId) =>
  postJSON("/api/v1/food/buy", { userId, foodId });

// ── Stories, memories, world feed, ask (Phase 5) ───────────────────
export const postStory = (userId, text, cityId, emoji) =>
  postJSON("/api/v1/stories", { userId, text, cityId, emoji });

export const fetchWorldFeed = (limit = 50) =>
  getJSON(`/api/v1/world/feed?limit=${limit}`);

export const postMemory = (userId, imageBase64, caption, cityId, nearbyUserIds) =>
  postJSON("/api/v1/memories", { userId, imageBase64, caption, cityId, nearbyUserIds });

export const askAgent = (fromUserId, fromName, toBotId, question, roomId, venueId) =>
  postJSON("/api/v1/ask", { fromUserId, fromName, toBotId, question, roomId, venueId });

// ── Phase 6: Language + Venues ─────────────────────────────────────
export const fetchCityLanguage = (cityId) =>
  getJSON(`/api/v1/cities/${encodeURIComponent(cityId)}/language`);
export const fetchVenue = (venueId) =>
  getJSON(`/api/v1/venues/${encodeURIComponent(venueId)}`);
export const fetchVenuesInCity = (cityId) =>
  getJSON(`/api/v1/cities/${encodeURIComponent(cityId)}/venues`);
export const fetchConversationSeeds = (venueId) =>
  getJSON(`/api/v1/conversation-seeds${venueId ? `?venueId=${encodeURIComponent(venueId)}` : ""}`);

// ── Phase 7E.6: Conversation archive ───────────────────────────────
export const fetchConversations = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  return getJSON(`/api/v1/conversations${qs.toString() ? `?${qs}` : ""}`);
};
export const fetchConversationTags = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  return getJSON(`/api/v1/conversations/tags${qs.toString() ? `?${qs}` : ""}`);
};
export const fetchUserConversations = (userId, limit = 10) =>
  getJSON(`/api/v1/users/${encodeURIComponent(userId)}/conversations?limit=${limit}`);

// ── Phase 7G: Bazaar ───────────────────────────────────────────────
export const fetchBazaar = (cityId) =>
  getJSON(cityId ? `/api/v1/bazaar?city=${encodeURIComponent(cityId)}` : "/api/v1/bazaar");
export const buyBazaarItem = (userId, itemId) =>
  postJSON("/api/v1/bazaar/buy", { userId, itemId });

// ── Phase 7I: Barter bundles ───────────────────────────────────────
export const fetchBarter = (cityId) =>
  getJSON(cityId ? `/api/v1/barter?city=${encodeURIComponent(cityId)}` : "/api/v1/barter");
export const tradeBundle = (userId, bundleId) =>
  postJSON("/api/v1/barter/trade", { userId, bundleId });

// ── Phase 8E: LLM status ───────────────────────────────────────────
export const fetchLlmStatus = () => getJSON("/api/v1/llm/status");

// ── Phase 9: Quests, reputation, travel, digest ────────────────────
export const fetchQuests = () => getJSON("/api/v1/quests");
export const fetchUserQuests = (userId) =>
  getJSON(`/api/v1/users/${encodeURIComponent(userId)}/quests`);
export const acceptQuest = (userId, questId) =>
  postJSON("/api/v1/quests/accept", { userId, questId });
export const fetchUserReputation = (userId) =>
  getJSON(`/api/v1/users/${encodeURIComponent(userId)}/reputation`);
export const fetchCityLeaderboard = (cityId) =>
  getJSON(`/api/v1/cities/${encodeURIComponent(cityId)}/leaderboard`);
export const fetchTravelTickets = () => getJSON("/api/v1/travel/tickets");
export const buyTravelTicket = (userId, cityId) =>
  postJSON("/api/v1/travel/buy", { userId, cityId });
export const fetchDailyDigest = (cityId) =>
  getJSON(cityId ? `/api/v1/digest?city=${encodeURIComponent(cityId)}` : "/api/v1/digest");
