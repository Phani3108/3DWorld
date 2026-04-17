// Persistent user store (DB when available, JSON fallback)

import fs from "fs";
import crypto from "crypto";
import * as db from "./db.js";
import { sanitizeAvatarUrl, sanitizeAccentId, DEFAULT_ACCENT_ID, getAvatarById, AVATAR_CATALOG } from "./itemCatalog.js";
import { getCity } from "./shared/cityCatalog.js";
import { atomicWriteJson, pushCapped } from "./persistence.js";

const {
  isDbAvailable,
  getUserById,
  upsertUser,
  setUserCoins: dbSetUserCoins,
  touchUser: dbTouchUser,
  validateSessionToken: dbValidateSessionToken,
  updateUserCoinsAtomic: dbUpdateUserCoinsAtomic,
  transferCoinsAtomic: dbTransferCoinsAtomic,
  hasCompletedQuest: dbHasCompletedQuest,
  recordCompletedQuest: dbRecordCompletedQuest,
} = db;
const dbSetSessionToken = db.setSessionToken;

export const DEFAULT_COINS = 100;

const USERS_FILE = "users.json";
const COMPLETED_QUESTS_FILE = "completed_quests.json";
const users = new Map(); // userId -> user record
const completedQuests = new Map(); // `${userId}-${questId}` -> { userId, questId, reward, completedAt }

const nowMs = () => Date.now();
const SESSION_TOKEN_HASH_PREFIX = "sha256:";
const hashSessionToken = (token) =>
  `${SESSION_TOKEN_HASH_PREFIX}${crypto.createHash("sha256").update(token).digest("hex")}`;

export const createUserId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
};

export const createSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const persistUsers = () => {
  if (isDbAvailable()) return;
  const payload = [...users.values()];
  atomicWriteJson(USERS_FILE, payload);
};

// ── Motives (Sims-style needs) defaults ─────────────────────────────
// Applied to every user record so humans get the same mechanic that bots
// already have via shared/roomConstants.js OBJECT_AFFORDANCES.
const DEFAULT_MOTIVES = { energy: 100, hunger: 100, fun: 100, social: 100 };

// ── Public-profile fields every user record should have ────────────
// New fields default to null/empty so pre-existing records stay valid.
const ensureProfileDefaults = (user) => {
  if (!user) return user;
  if (user.avatarId === undefined) user.avatarId = null;
  if (user.avatarUrl === undefined) user.avatarUrl = null;
  if (user.accentId === undefined) user.accentId = DEFAULT_ACCENT_ID;
  if (user.pronouns === undefined) user.pronouns = "";
  if (user.bio === undefined) user.bio = "";
  if (user.homeCity === undefined) user.homeCity = null;
  if (!user.socials) user.socials = {};
  if (!Array.isArray(user.stories)) user.stories = [];
  if (!Array.isArray(user.memories)) user.memories = [];
  if (!Array.isArray(user.learnedFacts)) user.learnedFacts = [];
  if (!user.dailyQuestState) user.dailyQuestState = { day: "", completed: [] };
  if (!user.motives) user.motives = { ...DEFAULT_MOTIVES, updatedAt: Date.now() };
  if (!user.inventory) user.inventory = { food: [] };
  if (user.teachingCount === undefined) user.teachingCount = 0;
  return user;
};

export const loadUserStore = () => {
  if (isDbAvailable()) return;
  let migratedTokens = false;
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      data.forEach((u) => {
        if (!u || !u.id) return;
        if (typeof u.sessionToken === "string" && !u.sessionToken.startsWith(SESSION_TOKEN_HASH_PREFIX)) {
          u.sessionToken = hashSessionToken(u.sessionToken);
          migratedTokens = true;
        }
        ensureProfileDefaults(u);
        users.set(u.id, u);
      });
    }
  } catch {
    // No users.json yet, that's fine
  }
  if (migratedTokens) persistUsers();
};

export const getUser = async (userId) => {
  if (!userId) return null;
  if (isDbAvailable()) {
    return await getUserById(userId);
  }
  return users.get(userId) || null;
};

export const ensureUser = async ({ userId, name = null, isBot = false } = {}) => {
  if (!userId) return null;
  if (isDbAvailable()) {
    // Check if user exists first to determine if we need a new session token
    const existingUser = await getUserById(userId);
    const sessionToken = existingUser ? undefined : createSessionToken();
    const record = await upsertUser({
      id: userId,
      name,
      isBot: !!isBot,
      coins: DEFAULT_COINS,
      sessionToken,
    });
    return record;
  }

  const existing = users.get(userId);
  if (!existing) {
    const createdAt = nowMs();
    const sessionToken = createSessionToken();
    const record = ensureProfileDefaults({
      id: userId,
      name: name || null,
      isBot: !!isBot,
      coins: DEFAULT_COINS,
      sessionToken: hashSessionToken(sessionToken),
      createdAt,
      updatedAt: createdAt,
      lastSeenAt: createdAt,
    });
    users.set(userId, record);
    persistUsers();
    return record;
  }
  ensureProfileDefaults(existing);

  let changed = false;
  if (name && existing.name !== name) {
    existing.name = name;
    changed = true;
  }
  if (existing.isBot !== !!isBot) {
    existing.isBot = !!isBot;
    changed = true;
  }
  existing.lastSeenAt = nowMs();
  if (changed) existing.updatedAt = existing.lastSeenAt;
  if (changed) persistUsers();
  return existing;
};

export const touchUser = async (userId) => {
  if (!userId) return;
  if (isDbAvailable()) {
    await dbTouchUser(userId);
    return;
  }
  const existing = users.get(userId);
  if (!existing) return;
  existing.lastSeenAt = nowMs();
  existing.updatedAt = existing.lastSeenAt;
  persistUsers();
};

export const setUserCoins = async (userId, coins) => {
  if (!userId || typeof coins !== "number") return null;
  if (isDbAvailable()) {
    const updated = await dbSetUserCoins(userId, coins);
    return updated;
  }
  const existing = users.get(userId);
  if (!existing) return null;
  existing.coins = coins;
  existing.updatedAt = nowMs();
  existing.lastSeenAt = existing.updatedAt;
  persistUsers();
  return coins;
};

export const updateUserCoins = async (userId, delta) => {
  if (!userId || typeof delta !== "number") return null;
  if (isDbAvailable()) {
    return await dbUpdateUserCoinsAtomic(userId, delta);
  }
  // JSON fallback - still uses read-modify-write (acceptable for single instance)
  const user = users.get(userId);
  if (!user) return null;
  const current = typeof user.coins === "number" ? user.coins : DEFAULT_COINS;
  const updated = Math.max(0, current + delta);
  user.coins = updated;
  user.updatedAt = nowMs();
  user.lastSeenAt = user.updatedAt;
  persistUsers();
  return updated;
};

export const transferCoinsAtomic = async (fromUserId, toUserId, amount) => {
  if (!fromUserId || !toUserId || typeof amount !== "number" || amount <= 0) {
    return { ok: false, error: "invalid_amount" };
  }
  if (fromUserId === toUserId) {
    return { ok: false, error: "self_transfer" };
  }

  if (isDbAvailable() && typeof dbTransferCoinsAtomic === "function") {
    return await dbTransferCoinsAtomic(fromUserId, toUserId, amount);
  }

  const sender = users.get(fromUserId);
  if (!sender) return { ok: false, error: "sender_not_found" };
  const recipient = users.get(toUserId);
  if (!recipient) return { ok: false, error: "recipient_not_found" };

  const senderCoins = typeof sender.coins === "number" ? sender.coins : DEFAULT_COINS;
  if (senderCoins < amount) return { ok: false, error: "insufficient", have: senderCoins };

  const recipientCoins = typeof recipient.coins === "number" ? recipient.coins : DEFAULT_COINS;
  const newSender = senderCoins - amount;
  const newRecipient = recipientCoins + amount;

  const now = nowMs();
  sender.coins = newSender;
  sender.updatedAt = now;
  sender.lastSeenAt = now;
  recipient.coins = newRecipient;
  recipient.updatedAt = now;
  recipient.lastSeenAt = now;
  persistUsers();

  return { ok: true, fromBalance: newSender, toBalance: newRecipient };
};

export const validateSessionToken = async (userId, token) => {
  if (!userId || !token) return false;
  if (isDbAvailable()) {
    return await dbValidateSessionToken(userId, token);
  }
  const user = users.get(userId);
  if (!user?.sessionToken) return false;
  const hashed = hashSessionToken(token);
  if (user.sessionToken === hashed) return true;

  // Backward compatibility for legacy plaintext tokens; upgrade on first valid use.
  if (user.sessionToken === token) {
    user.sessionToken = hashed;
    persistUsers();
    return true;
  }
  return false;
};

export const setSessionToken = async (userId, token) => {
  if (!userId || !token) return false;
  if (isDbAvailable() && typeof dbSetSessionToken === "function") {
    return await dbSetSessionToken(userId, token);
  }
  const user = users.get(userId);
  if (!user) return false;
  user.sessionToken = hashSessionToken(token);
  persistUsers();
  return true;
};

// --- Completed Quests (prevents re-acceptance for infinite coins) ---

const persistCompletedQuests = () => {
  if (isDbAvailable()) return;
  fs.writeFileSync(COMPLETED_QUESTS_FILE, JSON.stringify([...completedQuests.values()], null, 2));
};

export const loadCompletedQuests = () => {
  if (isDbAvailable()) return;
  try {
    const raw = fs.readFileSync(COMPLETED_QUESTS_FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      data.forEach((entry) => {
        if (entry && entry.userId && entry.questId) {
          completedQuests.set(`${entry.userId}-${entry.questId}`, entry);
        }
      });
    }
  } catch {
    // No completed_quests.json yet, that's fine
  }
};

export const hasCompletedQuest = async (userId, questId) => {
  if (!userId || !questId) return false;
  if (isDbAvailable()) {
    return await dbHasCompletedQuest(userId, questId);
  }
  return completedQuests.has(`${userId}-${questId}`);
};

export const recordCompletedQuest = async (userId, questId, reward) => {
  if (!userId || !questId) return;
  if (isDbAvailable()) {
    await dbRecordCompletedQuest(userId, questId, reward);
    return;
  }
  const key = `${userId}-${questId}`;
  completedQuests.set(key, { userId, questId, reward, completedAt: Date.now() });
  persistCompletedQuests();
};

// --- Profile (v2) --------------------------------------------------------
// HTML strip — defense-in-depth; React escapes on render.
const stripHtml = (s) => (typeof s === "string" ? s.replace(/<[^>]*>/g, "") : s);
const clampStr = (s, n) => (typeof s === "string" ? s.slice(0, n) : "");

// Social-handle validators — invalid handles are silently dropped.
const SOCIAL_VALIDATORS = {
  twitter:   (v) => { const s = clampStr(String(v).replace(/^@/, ""), 30); return /^[A-Za-z0-9_]{1,15}$/.test(s) ? s : null; },
  instagram: (v) => { const s = clampStr(String(v).replace(/^@/, ""), 40); return /^[A-Za-z0-9._]{1,30}$/.test(s) ? s : null; },
  github:    (v) => { const s = clampStr(String(v).replace(/^@/, ""), 50); return /^[A-Za-z0-9-]{1,39}$/.test(s) ? s : null; },
  linkedin:  (v) => { const s = clampStr(String(v).replace(/^@?in\//, "").replace(/^@/, ""), 60); return /^[A-Za-z0-9-]{3,100}$/.test(s) ? s : null; },
  website:   (v) => {
    try {
      const u = new URL(String(v));
      if (u.protocol !== "https:") return null;
      if (/^(10\.|127\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(u.hostname)) return null;
      return u.href.slice(0, 200);
    } catch { return null; }
  },
  farcaster: (v) => { const s = clampStr(String(v).replace(/^@/, ""), 40); return /^[A-Za-z0-9._-]{1,30}$/.test(s) ? s : null; },
};

const sanitizeSocials = (socials) => {
  if (!socials || typeof socials !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(socials)) {
    const validator = SOCIAL_VALIDATORS[k];
    if (!validator) continue;
    const normalized = validator(v);
    if (normalized) out[k] = normalized;
  }
  return out;
};

/**
 * Patch a user's profile fields. Only file-backed for now — callers on the
 * DB path can extend `db.js` later. Missing / invalid values in `patch` are
 * ignored rather than cleared (so callers can send partial updates).
 *
 * @param {string} userId
 * @param {{
 *   avatarId?: string, avatarUrl?: string,
 *   accentId?: string, pronouns?: string, bio?: string,
 *   homeCity?: string, socials?: object,
 * }} patch
 * @returns {object|null} updated record (public projection safe)
 */
export const updateProfile = async (userId, patch = {}) => {
  if (!userId || !patch || typeof patch !== "object") return null;

  // File-backed path
  const existing = users.get(userId);
  if (!existing) return null;
  ensureProfileDefaults(existing);

  if (typeof patch.avatarId === "string") {
    const entry = getAvatarById(patch.avatarId);
    if (entry) {
      existing.avatarId = entry.id;
      existing.avatarUrl = entry.url;
    }
  }
  if (typeof patch.avatarUrl === "string") {
    const clean = sanitizeAvatarUrl(patch.avatarUrl);
    existing.avatarUrl = clean;
    // If URL matches a catalog entry, record its id too.
    const match = AVATAR_CATALOG.find((a) => a.url === clean);
    existing.avatarId = match ? match.id : existing.avatarId || null;
  }
  if (typeof patch.accentId === "string") existing.accentId = sanitizeAccentId(patch.accentId);
  if (typeof patch.pronouns === "string") existing.pronouns = clampStr(stripHtml(patch.pronouns), 30);
  if (typeof patch.bio === "string")      existing.bio      = clampStr(stripHtml(patch.bio), 200);
  if (typeof patch.homeCity === "string") {
    const c = getCity(patch.homeCity);
    if (c) existing.homeCity = c.id;
  }
  if (patch.socials && typeof patch.socials === "object") {
    existing.socials = { ...existing.socials, ...sanitizeSocials(patch.socials) };
  }

  existing.updatedAt = nowMs();
  persistUsers();
  return existing;
};

/**
 * Public-safe projection of a user record. Never returns tokens / emails.
 * Trims stories / memories / learnedFacts to the count requested.
 */
export const publicProfile = (user, { storyLimit = 20, memoryLimit = 30, factLimit = 30 } = {}) => {
  if (!user) return null;
  ensureProfileDefaults(user);
  return {
    id: user.id,
    name: user.name,
    isBot: !!user.isBot,
    avatarId: user.avatarId,
    avatarUrl: user.avatarUrl,
    accentId: user.accentId || DEFAULT_ACCENT_ID,
    pronouns: user.pronouns || "",
    bio: user.bio || "",
    homeCity: user.homeCity || null,
    socials: user.socials || {},
    stats: {
      coins: user.coins,
      storyCount: (user.stories || []).length,
      memoryCount: (user.memories || []).length,
      factCount: (user.learnedFacts || []).length,
      teachingCount: user.teachingCount || 0,
    },
    stories:      (user.stories      || []).slice(0, storyLimit),
    memories:     (user.memories     || []).slice(0, memoryLimit),
    learnedFacts: (user.learnedFacts || []).slice(0, factLimit),
    createdAt: user.createdAt,
  };
};

/** Accessor used by story/memory/fact endpoints to push capped entries. */
export const appendToUserList = async (userId, field, item, cap) => {
  if (!userId || !field || !item) return null;
  if (isDbAvailable()) return null; // DB path deferred
  const existing = users.get(userId);
  if (!existing) return null;
  ensureProfileDefaults(existing);
  if (!Array.isArray(existing[field])) existing[field] = [];
  pushCapped(existing[field], item, cap);
  existing.updatedAt = nowMs();
  persistUsers();
  return item;
};

/** Read-only list of all users' public profiles (for bulletin / world feed). */
export const listPublicProfiles = () => {
  if (isDbAvailable()) return [];
  return [...users.values()].map((u) => publicProfile(u));
};

// --- Motives (Sims-style needs) ------------------------------------------
// Decay is applied lazily: every mutation computes the decay since the last
// update before writing. This avoids a separate cron and is deterministic.
const MOTIVE_DECAY_PER_SEC = { energy: 0.11, social: 0.09, fun: 0.09, hunger: 0.06 };
const MOTIVE_CLAMP = { min: 0, max: 100 };
const clampMotive = (v) => Math.max(MOTIVE_CLAMP.min, Math.min(MOTIVE_CLAMP.max, v));

const applyLazyDecay = (user, now = Date.now()) => {
  if (!user.motives) user.motives = { energy: 100, hunger: 100, fun: 100, social: 100, updatedAt: now };
  const last = user.motives.updatedAt || now;
  const elapsedSec = Math.max(0, (now - last) / 1000);
  if (elapsedSec <= 0) return user.motives;
  for (const key of Object.keys(MOTIVE_DECAY_PER_SEC)) {
    const cur = typeof user.motives[key] === "number" ? user.motives[key] : 100;
    user.motives[key] = clampMotive(Math.round((cur - MOTIVE_DECAY_PER_SEC[key] * elapsedSec) * 100) / 100);
  }
  user.motives.updatedAt = now;
  return user.motives;
};

/**
 * Read current motives (with lazy decay applied). Does NOT persist.
 * Callers that want to persist should call `persistUsers()` afterwards.
 */
export const peekMotives = async (userId) => {
  if (!userId) return null;
  if (isDbAvailable()) return null;
  const user = users.get(userId);
  if (!user) return null;
  ensureProfileDefaults(user);
  return applyLazyDecay(user);
};

/**
 * Apply a `satisfies` delta (e.g. eating biryani → hunger +40) after lazy
 * decay. Clamps to [0,100] and persists.
 * @param {string} userId
 * @param {Record<"energy"|"hunger"|"fun"|"social", number>} delta
 * @returns motives object or null
 */
export const applyMotives = async (userId, delta) => {
  if (!userId || !delta) return null;
  if (isDbAvailable()) return null;
  const user = users.get(userId);
  if (!user) return null;
  ensureProfileDefaults(user);
  applyLazyDecay(user);
  for (const [key, amount] of Object.entries(delta)) {
    if (typeof amount !== "number") continue;
    if (!(key in MOTIVE_DECAY_PER_SEC)) continue;
    user.motives[key] = clampMotive(user.motives[key] + amount);
  }
  user.motives.updatedAt = Date.now();
  user.updatedAt = user.motives.updatedAt;
  persistUsers();
  return user.motives;
};

// --- Inventory -----------------------------------------------------------
// inventory.food is an append-only list of tokens like `{ id, foodId, boughtAt }`.
// Eating removes one matching token. Capped so a buggy bot can't bloat the file.
const INVENTORY_FOOD_CAP = 50;

export const addToInventory = async (userId, bucket, item) => {
  if (!userId || !bucket || !item) return null;
  if (isDbAvailable()) return null;
  const user = users.get(userId);
  if (!user) return null;
  ensureProfileDefaults(user);
  if (!user.inventory[bucket]) user.inventory[bucket] = [];
  if (user.inventory[bucket].length >= INVENTORY_FOOD_CAP) {
    return { ok: false, error: "inventory_full" };
  }
  user.inventory[bucket].push(item);
  user.updatedAt = Date.now();
  persistUsers();
  return { ok: true, item };
};

/**
 * Remove the first inventory entry whose `foodId` matches. Returns true on
 * success, false if no matching entry exists.
 */
export const removeFromInventory = async (userId, bucket, foodId) => {
  if (!userId || !bucket || !foodId) return false;
  if (isDbAvailable()) return false;
  const user = users.get(userId);
  if (!user) return false;
  ensureProfileDefaults(user);
  const list = user.inventory[bucket] || [];
  const idx = list.findIndex((i) => i && i.foodId === foodId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  user.updatedAt = Date.now();
  persistUsers();
  return true;
};

/** Read the inventory for a user (no side effects). */
export const getInventory = async (userId) => {
  if (!userId) return null;
  if (isDbAvailable()) return null;
  const user = users.get(userId);
  if (!user) return null;
  ensureProfileDefaults(user);
  return user.inventory;
};

/** Increment a bot's teaching counter after they answer a question. */
export const incrementTeachingCount = async (userId, delta = 1) => {
  if (!userId) return null;
  if (isDbAvailable()) return null;
  const user = users.get(userId);
  if (!user) return null;
  ensureProfileDefaults(user);
  user.teachingCount = (user.teachingCount || 0) + delta;
  user.updatedAt = Date.now();
  persistUsers();
  return user.teachingCount;
};
