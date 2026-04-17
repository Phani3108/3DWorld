/**
 * Reaction catalog — the shared expressive vocabulary between humans and agents.
 *
 * Three layers:
 *  1. Animated emotes (full body clips) — see itemCatalog.js ALLOWED_EMOTES
 *  2. Emoji reactions — a curated allowlist grouped for the picker UI.
 *     Emitted as a 3-second floating bubble above the character.
 *  3. Memes — captioned images shipped in client/public/memes/ (no hotlinking,
 *     no runtime uploads — adding one is a PR-driven moderation step).
 *
 * Phase 1.5 exposes this as pure data + GET endpoints. The socket/REST
 * emit path lives in Phase 4 alongside other activity handlers.
 */

// ── Emoji ──────────────────────────────────────────────────────────
// Grouped for the picker UI. Order within a group is UX — most-used first.
export const EMOJI_REACTIONS = {
  faces:   ["😀", "😂", "🥹", "🥰", "😎", "🤯", "😅", "🙃", "😭", "🤔", "😬", "🫠", "🫡", "🙌"],
  hearts:  ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "💖", "💔", "💘"],
  hands:   ["👋", "🙏", "👍", "👎", "👏", "🤝", "🤘", "🤌", "✌️", "🤞", "🫶"],
  food:    ["🍕", "🍔", "🍜", "🍣", "🍛", "☕", "🍵", "🍺", "🥂", "🍰", "🍩", "🌮", "🍿"],
  animals: ["🦀", "🐙", "🦋", "🐱", "🐶", "🦊", "🦁", "🐼", "🦉", "🐢"],
  weather: ["🌞", "🌧️", "⛅", "🌈", "❄️", "⚡", "🔥", "💫", "🌊"],
  objects: ["🎉", "🎊", "🎁", "🎵", "💡", "⭐", "🌟", "✨", "🚀", "🏆", "💎"],
};

// Flat set used for O(1) validation in the reaction handler.
const _flat = new Set();
for (const group of Object.values(EMOJI_REACTIONS)) {
  for (const e of group) _flat.add(e);
}

/** @returns {boolean} */
export const isValidEmojiReaction = (emoji) => _flat.has(emoji);

// ── Memes ──────────────────────────────────────────────────────────
// Each entry references a file shipped under client/public/memes/ at build time.
// No external URLs. To add a meme, drop a WebP ≤ 50 KB into the folder and add
// an entry here in a PR (the PR is the moderation gate).
export const MEME_LIBRARY = [
  { id: "this_is_fine",      label: "This is fine",            path: "/memes/this_is_fine.webp",      credit: "KC Green / CC-BY" },
  { id: "mind_blown",        label: "Mind blown",              path: "/memes/mind_blown.webp",        credit: "public domain" },
  { id: "doge_wow",          label: "Wow, much impress",       path: "/memes/doge_wow.webp",          credit: "public domain" },
  { id: "drake_hotline",     label: "Drake — prefer this",     path: "/memes/drake.webp",             credit: "self-drawn" },
  { id: "distracted_bf",     label: "Distracted boyfriend",    path: "/memes/distracted.webp",        credit: "self-drawn" },
  { id: "galaxy_brain",      label: "Galaxy brain",            path: "/memes/galaxy_brain.webp",      credit: "self-drawn" },
  { id: "surprised_pikachu", label: "Surprised Pikachu",       path: "/memes/pikachu.webp",           credit: "self-drawn" },
  { id: "change_my_mind",    label: "Change my mind",          path: "/memes/change_my_mind.webp",    credit: "self-drawn" },
  { id: "hide_the_pain",     label: "Hide the pain",           path: "/memes/hide_the_pain.webp",     credit: "self-drawn" },
  { id: "one_does_not",      label: "One does not simply",     path: "/memes/one_does_not.webp",      credit: "self-drawn" },
  { id: "agent_thinking",    label: "AI agent thinking",       path: "/memes/agent_thinking.webp",    credit: "self-drawn" },
  { id: "this_is_the_way",   label: "This is the way",         path: "/memes/this_is_the_way.webp",   credit: "self-drawn" },
];

const _memeIds = new Set(MEME_LIBRARY.map((m) => m.id));

/** @returns {boolean} */
export const isValidMemeId = (id) => _memeIds.has(id);

/** @param {string} id */
export const getMeme = (id) => MEME_LIBRARY.find((m) => m.id === id) || null;

/**
 * Validate an incoming reaction payload. Returns a sanitized copy or null.
 * @param {{type: string, value: string}} payload
 * @returns {{type: "emoji"|"meme", value: string}|null}
 */
export const sanitizeReaction = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const { type, value } = payload;
  if (typeof value !== "string" || value.length === 0) return null;
  if (type === "emoji" && isValidEmojiReaction(value)) return { type: "emoji", value };
  if (type === "meme"  && isValidMemeId(value))        return { type: "meme",  value };
  return null;
};
