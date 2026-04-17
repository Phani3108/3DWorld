/**
 * worldFeed — cross-city news feed backed by a flat JSON file.
 *
 * Holds the last `WORLD_FEED_CAP` entries (any `type`: story, bond milestone,
 * memorable moment, learned fact). Everyone in every city reads the same feed,
 * so the world feels inhabited even when you're alone in Hyderabad.
 */

import fs from "fs";
import crypto from "crypto";
import { atomicWriteJson, readJsonSafe, pushCapped } from "./persistence.js";

const FEED_FILE = "worldFeed.json";
const WORLD_FEED_CAP = 200;

let feed = readJsonSafe(FEED_FILE, []);
if (!Array.isArray(feed)) feed = [];

/** @returns {string} */
const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `wf_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const persist = () => {
  try {
    atomicWriteJson(FEED_FILE, feed);
  } catch (e) {
    console.error("[worldFeed] persist failed:", e.message);
  }
};

/**
 * Append an item to the world feed. Items older than the cap are dropped.
 * @param {{
 *   type: "story"|"bond"|"moment"|"fact"|"featured_agent",
 *   actorUserId?: string,
 *   actorName?: string,
 *   actorIsBot?: boolean,
 *   cityId?: string|null,
 *   text?: string,
 *   emoji?: string,
 *   imagePath?: string,
 *   meta?: object,
 * }} item
 */
export const addToFeed = (item) => {
  if (!item || typeof item !== "object") return null;
  const entry = {
    id: newId(),
    createdAt: Date.now(),
    ...item,
  };
  pushCapped(feed, entry, WORLD_FEED_CAP);
  persist();
  return entry;
};

/** Return the current feed (newest first, already the insert order). */
export const getFeed = (limit = 50) => feed.slice(0, Math.max(1, Math.min(WORLD_FEED_CAP, limit)));

/** Remove all entries authored by a given user (e.g. on account deletion — future). */
export const pruneByUser = (userId) => {
  const before = feed.length;
  feed = feed.filter((f) => f.actorUserId !== userId);
  if (feed.length !== before) persist();
};

export const clearFeed = () => {
  feed = [];
  persist();
};
