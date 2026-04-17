/**
 * residentService — spawn named resident agents + run a light ambient tick.
 *
 * Residents are regular `isBot: true` characters that live permanently in
 * their home city's cached room. They don't hold a socket connection; the
 * server emits broadcasts on their behalf (move, chat, react, wave).
 *
 * Ask-an-Agent requests targeting a resident id fall through to the venue
 * canned-answer bank (Phase 6) because the resident's botRegistry entry has
 * webhookUrl=null — so the existing flow just works.
 */

import crypto from "crypto";
import { RESIDENTS, listResidentIds, getResident } from "./shared/residentCatalog.js";
import { getVenue } from "./shared/venueCatalog.js";

const RESIDENT_TICK_MS = 6000;          // one behaviour step every 6 seconds
const GREETING_DEBOUNCE_MS = 12_000;    // don't re-greet the same arrival twice

// Per-resident state (positions, last-greeted, etc.) — in-memory only.
const residentState = new Map();

/**
 * Deterministic stable id we use as both the in-world character id AND the
 * botRegistry key so the Ask flow can resolve by name or id.
 */
const botKeyFor = (residentId) => `resident_${residentId}`;

/** Hash used as a synthetic webhookSecret (never actually used, but bot-registry expects one). */
const syntheticSecret = (residentId) =>
  crypto.createHash("sha256").update(`resident:${residentId}`).digest("hex");

/**
 * Seed users + botRegistry + in-world characters for every resident.
 * Idempotent: re-running is safe; existing entries are refreshed with the
 * latest catalog values (name/avatar/bio may drift as we edit the catalog).
 */
export const spawnResidents = async ({
  rooms,
  botRegistry,
  saveBotRegistry,
  ensureUser,
  updateProfile,
  getCachedRoom,
  updateGrid,
}) => {
  let seeded = 0;
  let skipped = 0;

  for (const residentId of listResidentIds()) {
    const r = getResident(residentId);
    const venue = getVenue(r.homeVenueId);
    const roomId = `city_${r.cityId}`;
    const room = getCachedRoom(roomId);
    if (!room) {
      skipped++;
      console.warn(`[residents] room ${roomId} not found for ${residentId}`);
      continue;
    }

    // 1. Users.json — profile record with the resident's flavour
    await ensureUser({ userId: residentId, name: r.name, isBot: true });
    await updateProfile(residentId, {
      avatarUrl: r.avatarUrl,
      accentId: r.accentId,
      pronouns: "",
      bio: r.bio,
      homeCity: r.cityId,
      socials: {},
    });

    // 2. botRegistry — no api key, no webhook (so Ask falls through to canned)
    const key = botKeyFor(residentId);
    if (!botRegistry.has(key)) {
      botRegistry.set(key, {
        name: r.name,
        createdAt: new Date().toISOString(),
        avatarUrl: r.avatarUrl,
        webhookUrl: null,
        webhookSecret: syntheticSecret(residentId),
        quests: [],
        shop: [],
        status: "verified",
        verifiedAt: new Date().toISOString(),
        isResident: true,
        residentId,
      });
      // Note: we don't call saveBotRegistry here — we batch at the end so a
      // single write covers all 14 residents.
    }

    // 3. In-world character at the venue's centre (or a random nearby cell)
    const existing = room.characters.find((c) => c.userId === residentId);
    if (existing) {
      // Refresh display fields but keep current position.
      existing.name = r.name;
      existing.avatarUrl = r.avatarUrl;
      existing.isBot = true;
      existing.isResident = true;
      skipped++;
      continue;
    }

    const spawnPos = venue
      ? [
          Math.round(venue.footprint.x + venue.footprint.w / 2),
          Math.round(venue.footprint.z + venue.footprint.d / 2),
        ]
      : [Math.floor(room.size[0] / 2), Math.floor(room.size[1] / 2)];

    const character = {
      id: `resident:${residentId}`,
      userId: residentId,
      session: 0,
      position: spawnPos,
      avatarUrl: r.avatarUrl,
      isBot: true,
      isResident: true,
      isOfficialBot: false,
      name: r.name,
      coins: 100,
      currentVenueId: r.homeVenueId,
      canUpdateRoom: false,
      invitedBy: null,
    };
    room.characters.push(character);

    residentState.set(residentId, {
      homePos: [...spawnPos],
      lastLineAt: 0,
      lastMoveAt: Date.now(),
      lastGreetedUserId: null,
      lastGreetedAt: 0,
      dwellTarget: spawnPos.slice(),
    });

    seeded++;
  }

  saveBotRegistry();
  console.log(`[residents] seeded ${seeded} residents (${skipped} already in place)`);
};

/**
 * Run a light ambient tick across all residents. Behaviour is intentionally
 * modest: occasional greetings + small position drifts within the home venue
 * footprint. Nothing chatty enough to spam the room.
 */
export const startResidentTick = ({ io, rooms, getCachedRoom }) => {
  const handle = setInterval(() => {
    const now = Date.now();
    for (const residentId of listResidentIds()) {
      const r = getResident(residentId);
      const roomId = `city_${r.cityId}`;
      const room = getCachedRoom(roomId);
      if (!room) continue;
      const char = room.characters.find((c) => c.userId === residentId);
      if (!char) continue;
      const state = residentState.get(residentId);
      if (!state) continue;

      // Greet any newly arrived human in the same venue, throttled.
      const recentArrivals = room.characters.filter((c) => {
        if (c.userId === residentId) return false;
        if (c.isBot) return false;
        if (c.currentVenueId !== r.homeVenueId) return false;
        // Did we already greet them in the last 12s?
        if (state.lastGreetedUserId === c.userId && now - state.lastGreetedAt < GREETING_DEBOUNCE_MS) return false;
        return true;
      });
      if (recentArrivals.length > 0) {
        const target = recentArrivals[0];
        const venue = getVenue(r.homeVenueId);
        const greet = venue?.conversation?.defaultGreeting || (r.defaultLines?.[0] || `Hey ${target.name}!`);
        io.to(room.id).emit("playerChatMessage", {
          id: char.id,
          name: r.name,
          message: greet,
        });
        io.to(room.id).emit("playerWaveAt", {
          fromId: char.id,
          targetId: target.id,
          fromName: r.name,
        });
        state.lastGreetedUserId = target.userId;
        state.lastGreetedAt = now;
        continue; // skip other behaviours this tick
      }

      // With ~20% chance, drop a default line (only if it's been >45s since last line).
      if (
        Math.random() < 0.2 &&
        now - state.lastLineAt > 45_000 &&
        Array.isArray(r.defaultLines) && r.defaultLines.length > 0
      ) {
        const line = r.defaultLines[Math.floor(Math.random() * r.defaultLines.length)];
        io.to(room.id).emit("playerChatMessage", {
          id: char.id,
          name: r.name,
          message: line,
        });
        state.lastLineAt = now;
      }

      // With ~10% chance, drift one cell within the venue footprint (keeps them alive).
      if (Math.random() < 0.1 && now - state.lastMoveAt > 15_000) {
        const venue = getVenue(r.homeVenueId);
        if (venue?.footprint) {
          const { x: fx, z: fz, w, d } = venue.footprint;
          const dx = Math.floor(Math.random() * 3) - 1;
          const dz = Math.floor(Math.random() * 3) - 1;
          const nx = Math.max(fx + 1, Math.min(fx + w - 1, char.position[0] + dx));
          const nz = Math.max(fz + 1, Math.min(fz + d - 1, char.position[1] + dz));
          if (nx !== char.position[0] || nz !== char.position[1]) {
            const prev = char.position;
            char.position = [nx, nz];
            io.to(room.id).emit("playerMove", {
              id: char.id,
              session: char.session,
              position: prev,
              path: [[nx, nz]],
            });
            state.lastMoveAt = now;
          }
        }
      }
    }
  }, RESIDENT_TICK_MS);

  handle.unref?.();
  return handle;
};

/**
 * Resolve a resident from a toBotId that may be the botRegistry key, the
 * resident id, or the resident name. Used by Ask-an-Agent to locate a
 * resident's in-world character id so canned replies bubble above them.
 */
export const findResidentCharacter = ({ toBotId, getCachedRoom }) => {
  if (!toBotId) return null;
  for (const residentId of listResidentIds()) {
    const r = getResident(residentId);
    if (
      residentId === toBotId ||
      r.name === toBotId ||
      botKeyFor(residentId) === toBotId
    ) {
      const room = getCachedRoom(`city_${r.cityId}`);
      if (!room) return null;
      const ch = room.characters.find((c) => c.userId === residentId);
      if (!ch) return null;
      return { resident: r, character: ch, room };
    }
  }
  return null;
};
