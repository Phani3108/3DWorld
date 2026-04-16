import { getRoom, saveRoom, isDbAvailable } from './db.js';

const cache = new Map();
const evictionTimers = new Map();

const EVICTION_DELAY = 5 * 60 * 1000; // 5 minutes

export function getCachedRoom(roomId) {
  return cache.get(roomId) || null;
}

export function setCachedRoom(room) {
  cache.set(room.id, room);
}

export function removeCachedRoom(roomId) {
  cache.delete(roomId);
}

export function getAllCachedRooms() {
  return Array.from(cache.values());
}

export async function getOrLoadRoom(roomId, hydrateRoom) {
  const cached = cache.get(roomId);
  if (cached) return cached;

  const dbRoom = await getRoom(roomId);
  if (!dbRoom) return null;

  const room = hydrateRoom(dbRoom);
  cache.set(roomId, room);
  return room;
}

const persistRetryQueue = new Map(); // roomId -> { room, attempts }
const MAX_PERSIST_RETRIES = 3;

export async function persistRoom(room) {
  if (!isDbAvailable()) return;
  try {
    await saveRoom(room);
    persistRetryQueue.delete(room.id);
  } catch (err) {
    console.error(`[roomCache] Failed to persist room ${room.id}:`, err);
    const entry = persistRetryQueue.get(room.id) || { attempts: 0 };
    entry.room = room;
    entry.attempts++;
    if (entry.attempts <= MAX_PERSIST_RETRIES) {
      persistRetryQueue.set(room.id, entry);
    } else {
      console.error(`[roomCache] Giving up on persisting room ${room.id} after ${MAX_PERSIST_RETRIES} retries`);
      persistRetryQueue.delete(room.id);
    }
  }
}

// Retry failed persists every 30 seconds
setInterval(async () => {
  for (const [roomId, entry] of persistRetryQueue) {
    try {
      await saveRoom(entry.room);
      persistRetryQueue.delete(roomId);
    } catch {
      entry.attempts++;
      if (entry.attempts > MAX_PERSIST_RETRIES) {
        console.error(`[roomCache] Giving up on persisting room ${roomId} after retries`);
        persistRetryQueue.delete(roomId);
      }
    }
  }
}, 30_000);

export function scheduleEviction(roomId) {
  if (roomId === 'plaza') return;
  cancelEviction(roomId);
  const timer = setTimeout(() => {
    evictionTimers.delete(roomId);
    const room = cache.get(roomId);
    // Never evict rooms with active players — reschedule instead
    if (room && room.characters && room.characters.length > 0) {
      scheduleEviction(roomId);
      return;
    }
    cache.delete(roomId);
  }, EVICTION_DELAY);
  evictionTimers.set(roomId, timer);
}

export function cancelEviction(roomId) {
  const timer = evictionTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    evictionTimers.delete(roomId);
  }
}

export function getCacheSize() {
  return cache.size;
}
