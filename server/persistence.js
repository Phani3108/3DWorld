// Atomic JSON persistence helpers.
// Crash-safe alternative to the existing `fs.writeFileSync` pattern used by
// bonds.json / users.json — write to a temp file, then rename so a crash
// mid-write never leaves a half-written JSON that breaks server boot.

import fs from "fs";
import path from "path";

/**
 * Atomically write a JSON object to disk.
 * Writes to `<path>.tmp` first, then renames. Rename is atomic on POSIX.
 * @param {string} filePath
 * @param {any} obj
 */
export const atomicWriteJson = (filePath, obj) => {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, filePath);
};

/**
 * Read and parse a JSON file. Returns `fallback` on any error.
 * @template T
 * @param {string} filePath
 * @param {T} fallback
 * @returns {T}
 */
export const readJsonSafe = (filePath, fallback) => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

/**
 * Ensure a directory exists, creating parents as needed.
 * @param {string} dirPath
 */
export const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

/**
 * Capped push — mutates array to keep only the newest `cap` items.
 * Newest first is the convention across 3D World (stories, memories, world feed).
 * @template T
 * @param {T[]} arr
 * @param {T} item
 * @param {number} cap
 * @returns {T[]} the same array (for chaining)
 */
export const pushCapped = (arr, item, cap) => {
  arr.unshift(item);
  if (arr.length > cap) arr.length = cap;
  return arr;
};

export const joinPath = path.join;
