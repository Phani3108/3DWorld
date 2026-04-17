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

export const askAgent = (fromUserId, fromName, toBotId, question, roomId) =>
  postJSON("/api/v1/ask", { fromUserId, fromName, toBotId, question, roomId });
