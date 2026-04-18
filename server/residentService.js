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
import { pickRandomScene, listVenuesWithDialogues } from "./shared/ambientDialogues.js";

const RESIDENT_TICK_MS = 6000;          // one behaviour step every 6 seconds
const GREETING_DEBOUNCE_MS = 12_000;    // don't re-greet the same arrival twice

// Phase 7K — time-of-day flavour. Uses server-local clock; demo-only,
// not personalised to the visitor's timezone. Returns one of:
//   "morning"   04:00 – 11:59
//   "afternoon" 12:00 – 16:59
//   "evening"   17:00 – 20:59
//   "night"     21:00 – 03:59
const TIME_OF_DAY_LINES = {
  morning: [
    "subha subha — chai bhi hai bhai.",
    "Morning light, best time of day.",
    "Freshly opened, freshly ready.",
  ],
  afternoon: [
    "Dopahar ki bhook lagi hai, aa jao.",
    "Lunch rush settling down.",
    "Afternoon is for long conversations.",
  ],
  evening: [
    "Shaam ki chai garam karte hain?",
    "Sunset's the best hour here.",
    "Evening crowd coming in.",
  ],
  night: [
    "Raat hone wali hai — close karne wala hun.",
    "Night shift, last orders soon.",
    "Quiet now. The best time to just sit.",
  ],
};

const currentTimeOfDay = (now = new Date()) => {
  const h = now.getHours();
  if (h >= 4 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
};

// Phase 7E.5 — ambient scripted dialogues.
const AMBIENT_TICK_MS = 10_000;          // check every 10 s whether a venue is due
const AMBIENT_VENUE_COOLDOWN_MS = 35_000; // at most one scene per venue per ~35 s
const AMBIENT_USER_CHAT_GRACE_MS = 10_000;// if anyone chatted recently, skip
const AMBIENT_LINE_STAGGER_MIN_MS = 2200; // stagger lines within a scene
const AMBIENT_LINE_STAGGER_MAX_MS = 3800;

// Per-resident state (positions, last-greeted, etc.) — in-memory only.
const residentState = new Map();

// Per-venue ambient state — { lastSceneAt, lastUserChatAt }
const ambientVenueState = new Map();

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
      existing.role = r.role || "host";
      existing.expertise = Array.isArray(r.expertise) ? r.expertise.slice() : [];
      skipped++;
      continue;
    }

    // Phase 7E.4 — hosts spawn at venue centre; regulars offset by +2 cells
    // (clamped inside the footprint) so they don't overlap the host's model.
    const role = r.role || "host";
    const spawnPos = venue
      ? (() => {
          const cx = venue.footprint.x + venue.footprint.w / 2;
          const cz = venue.footprint.z + venue.footprint.d / 2;
          if (role === "regular") {
            const dx = Math.max(1, Math.min(venue.footprint.w - 2, 2));
            const dz = Math.max(1, Math.min(venue.footprint.d - 2, 2));
            return [
              Math.round(cx + dx),
              Math.round(cz + dz),
            ];
          }
          return [Math.round(cx), Math.round(cz)];
        })()
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
      // Phase 7E.2 — surface the resident's expertise so the client can
      // render the proximity emoji float + hover chip without a second
      // round-trip to /api/v1/residents.
      role: r.role || "host",
      expertise: Array.isArray(r.expertise) ? r.expertise.slice() : [],
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
        // Phase 7K — 30% of the time pick a time-of-day flavour line
        // instead of the resident's defaults so the world feels clock-aware.
        let line;
        if (Math.random() < 0.3) {
          const todPool = TIME_OF_DAY_LINES[currentTimeOfDay()] || [];
          if (todPool.length > 0) line = todPool[Math.floor(Math.random() * todPool.length)];
        }
        if (!line) line = r.defaultLines[Math.floor(Math.random() * r.defaultLines.length)];
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
 * Phase 7E.5 — start the ambient-dialogue runner. Fires at most one
 * scripted mini-scene per venue per cooldown window, staggering the
 * lines 2-4 s apart. Skips any venue where a real player has chatted
 * in the last 10 s (so ambience never trampled real conversation).
 *
 * Scenes are fire-and-forget: they go through `playerChatMessage` just
 * like any resident line so all existing UI (chat bubble, feed, bond
 * nudges) renders them unchanged. They are NOT written to the Ask-based
 * 🧠 learned-facts archive — atmosphere only, no knowledge tagging.
 */
export const startAmbientDialogueTick = ({ io, getCachedRoom }) => {
  const handle = setInterval(() => {
    const now = Date.now();
    for (const venueId of listVenuesWithDialogues()) {
      const venue = getVenue(venueId);
      if (!venue) continue;
      const room = getCachedRoom(`city_${venue.cityId}`);
      if (!room) continue;

      // Cooldown per venue — randomize the due-check so the 14 venues
      // don't all fire within the same second.
      const vs = ambientVenueState.get(venueId) || { lastSceneAt: 0, lastUserChatAt: 0 };
      if (now - vs.lastSceneAt < AMBIENT_VENUE_COOLDOWN_MS) continue;

      // Back off if a human spoke here recently — ambient is atmosphere,
      // not interruption. noteUserChat() records this from socketHandlers.
      if (now - vs.lastUserChatAt < AMBIENT_USER_CHAT_GRACE_MS) continue;

      const scene = pickRandomScene(venueId);
      if (!scene || !Array.isArray(scene.scene) || scene.scene.length === 0) continue;

      // Validate every speaker is actually a resident of this venue
      // (catches catalog drift without crashing the tick).
      const speakers = scene.scene.map((line) => {
        const resident = getResident(line.speakerId);
        if (!resident || resident.homeVenueId !== venueId) return null;
        const character = room.characters.find((c) => c.userId === line.speakerId);
        return character ? { character, resident, line: line.line } : null;
      });
      if (speakers.some((s) => s === null)) continue; // scene is stale, skip

      vs.lastSceneAt = now;
      ambientVenueState.set(venueId, vs);

      // Fire the lines with a small random stagger so it reads like talk.
      let cumulative = 0;
      for (const entry of speakers) {
        const stagger = AMBIENT_LINE_STAGGER_MIN_MS +
          Math.floor(Math.random() * (AMBIENT_LINE_STAGGER_MAX_MS - AMBIENT_LINE_STAGGER_MIN_MS));
        cumulative += stagger;
        setTimeout(() => {
          // Only emit if room + char still exist (edge cases around restart)
          const stillRoom = getCachedRoom(room.id);
          if (!stillRoom) return;
          const stillHere = stillRoom.characters.find((c) => c.id === entry.character.id);
          if (!stillHere) return;
          io.to(room.id).emit("playerChatMessage", {
            id: entry.character.id,
            name: entry.resident.name,
            message: entry.line,
            ambient: true, // 7E.6 uses this flag to skip archiving.
          });
        }, cumulative);
      }
    }
  }, AMBIENT_TICK_MS);

  handle.unref?.();
  return handle;
};

/**
 * Phase 7E.5 — called from socketHandlers on real user chat so the
 * ambient runner knows to back off in that venue for a short grace
 * window. `cityId` + character position → venueId lookup is done by
 * the caller (we already have venue proximity there).
 */
export const noteUserChatInVenue = (venueId) => {
  if (!venueId) return;
  const vs = ambientVenueState.get(venueId) || { lastSceneAt: 0, lastUserChatAt: 0 };
  vs.lastUserChatAt = Date.now();
  ambientVenueState.set(venueId, vs);
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
