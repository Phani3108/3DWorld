/**
 * Events catalog — Phase 9G (post-audit).
 *
 * Time-bound resident gatherings. Each event is a scheduled "live" slot
 * at a venue with a recurring weekly slot in server-local time, run by
 * the venue's host. While an event is active, the venue lights up:
 *   • VenueInfoCard shows a 🟢 LIVE NOW chip with the event title.
 *   • Ambient dialogues swap to the event-specific scene pool.
 *   • Asking the host triggers an event-themed canned bank suffix
 *     (encoded as extra keywords on the venue's existing answers).
 *
 * Schedule: dayOfWeek (0=Sun..6=Sat) + startHour + durationHours, all in
 * the server's local clock (same as Phase 7K time-of-day lines).
 *
 * Why a fixed catalog (no admin UI yet)?
 *   The point is to *anchor* social presence — players know "Friday 9pm
 *   at Church Street, Anu's set". User-generated events come later when
 *   the contributor pipeline matures.
 */

export const EVENTS = {
  // Hyderabad — weekend biryani special
  hyd_weekend_biryani: {
    id: "hyd_weekend_biryani",
    venueId: "hyd_paradise_biryani",
    cityId: "hyderabad",
    title: "Sunday Mutton Special",
    blurb: "Farah opens the bigger handi. Bring patience and a friend.",
    emoji: "🍛",
    schedule: { dayOfWeek: 0, startHour: 12, durationHours: 4 },
    boostXp: 5,
    boostRep: 2,
  },
  hyd_chai_chess: {
    id: "hyd_chai_chess",
    venueId: "hyd_niloufer_cafe",
    cityId: "hyderabad",
    title: "Friday Evening Chess",
    blurb: "Naseem brings the board. Asad keeps the chai coming.",
    emoji: "♟️",
    schedule: { dayOfWeek: 5, startHour: 18, durationHours: 3 },
    boostXp: 3,
    boostRep: 1,
  },

  // Dubai — majlis poetry night
  dxb_majlis_poetry: {
    id: "dxb_majlis_poetry",
    venueId: "dxb_desert_majlis",
    cityId: "dubai",
    title: "Thursday Oud & Poetry",
    blurb: "Aisha plays. Omar pours gahwa. Bring a question, leave with a verse.",
    emoji: "🎵",
    schedule: { dayOfWeek: 4, startHour: 20, durationHours: 3 },
    boostXp: 5,
    boostRep: 3,
  },

  // Bengaluru — indie night
  blr_indie_friday: {
    id: "blr_indie_friday",
    venueId: "blr_church_street_pub",
    cityId: "bengaluru",
    title: "Friday Indie Set",
    blurb: "Anu opens. Thermal headlines. Toit on tap till midnight.",
    emoji: "🎸",
    schedule: { dayOfWeek: 5, startHour: 21, durationHours: 4 },
    boostXp: 5,
    boostRep: 2,
  },
  blr_filter_morning: {
    id: "blr_filter_morning",
    venueId: "blr_mtr",
    cityId: "bengaluru",
    title: "Saturday Filter-Coffee Tasting",
    blurb: "Ravi runs three decoctions side-by-side. Free upgrade if you guess the bean origin.",
    emoji: "☕",
    schedule: { dayOfWeek: 6, startHour: 8, durationHours: 3 },
    boostXp: 4,
    boostRep: 2,
  },

  // Mumbai — sunset chai walk
  mum_marine_sunset: {
    id: "mum_marine_sunset",
    venueId: "mum_chowpatty_stall",
    cityId: "mumbai",
    title: "Sunset Vada Pav Hour",
    blurb: "Rohan hands them out hot. Salman tells Bollywood stories. Queen's Necklace lights up at 7.",
    emoji: "🌇",
    schedule: { dayOfWeek: 6, startHour: 18, durationHours: 2 },
    boostXp: 3,
    boostRep: 2,
  },

  // New York — pickle rotation day
  nyc_pickle_thursday: {
    id: "nyc_pickle_thursday",
    venueId: "nyc_katz",
    cityId: "newyork",
    title: "Thursday Pickle Rotation",
    blurb: "Estelle rolls out the new full-sour batch. Free taste with any pastrami plate.",
    emoji: "🥒",
    schedule: { dayOfWeek: 4, startHour: 17, durationHours: 4 },
    boostXp: 4,
    boostRep: 2,
  },
  nyc_block_party: {
    id: "nyc_block_party",
    venueId: "nyc_bodega",
    cityId: "newyork",
    title: "Friday Block-Party Mixtape",
    blurb: "DJ Reggie spins from the Arizona iced-tea cooler. Sasha hands out free bagels at midnight.",
    emoji: "🎤",
    schedule: { dayOfWeek: 5, startHour: 21, durationHours: 4 },
    boostXp: 5,
    boostRep: 3,
  },

  // Singapore — kopi morning + michelin lunch
  sg_kopi_dawn: {
    id: "sg_kopi_dawn",
    venueId: "sg_kopitiam",
    cityId: "singapore",
    title: "Sunday Kopi Dawn Patrol",
    blurb: "Uncle Lim grinds fresh. Xiao Ming's microfoam is finally consistent.",
    emoji: "☕",
    schedule: { dayOfWeek: 0, startHour: 6, durationHours: 3 },
    boostXp: 3,
    boostRep: 2,
  },
  sg_hawker_lunch: {
    id: "sg_hawker_lunch",
    venueId: "sg_lau_pa_sat",
    cityId: "singapore",
    title: "Hawker-Centre Lunch Rush",
    blurb: "Mei and Priya open all six woks. Chope responsibly.",
    emoji: "🍜",
    schedule: { dayOfWeek: 6, startHour: 12, durationHours: 3 },
    boostXp: 4,
    boostRep: 2,
  },

  // Sydney — dawn surf + arvo coffee
  syd_dawn_surf: {
    id: "syd_dawn_surf",
    venueId: "syd_bondi_chippery",
    cityId: "sydney",
    title: "Saturday Dawn Patrol",
    blurb: "Jack opens at 5:45 for the surfers. Maz reports the swell.",
    emoji: "🏄",
    schedule: { dayOfWeek: 6, startHour: 6, durationHours: 3 },
    boostXp: 4,
    boostRep: 2,
  },
  syd_arvo_geisha: {
    id: "syd_arvo_geisha",
    venueId: "syd_barista_lab",
    cityId: "sydney",
    title: "Friday Geisha Filter Flight",
    blurb: "Ari pulls four origins side by side. Free if you nail three of four.",
    emoji: "🌸",
    schedule: { dayOfWeek: 5, startHour: 15, durationHours: 3 },
    boostXp: 5,
    boostRep: 3,
  },
};

export const listEventIds = () => Object.keys(EVENTS);
export const getEvent = (id) => EVENTS[id] || null;
export const eventsAtVenue = (venueId) =>
  Object.values(EVENTS).filter((e) => e.venueId === venueId);
export const eventsInCity = (cityId) =>
  Object.values(EVENTS).filter((e) => e.cityId === cityId);
export const allEventsPublic = () => Object.values(EVENTS);

/**
 * Is this event currently live? Compares against server-local time.
 * Returns null when not live, or { event, msRemaining } when live.
 */
export const isLive = (event, now = new Date()) => {
  if (!event?.schedule) return null;
  const { dayOfWeek, startHour, durationHours } = event.schedule;
  if (now.getDay() !== dayOfWeek) return null;
  const startMs = new Date(now).setHours(startHour, 0, 0, 0);
  const endMs   = startMs + durationHours * 3600 * 1000;
  if (now.getTime() < startMs || now.getTime() >= endMs) return null;
  return { event, msRemaining: endMs - now.getTime() };
};

/** Return the live event at a venue right now, or null. */
export const liveEventAtVenue = (venueId, now = new Date()) => {
  for (const e of eventsAtVenue(venueId)) {
    const live = isLive(e, now);
    if (live) return live;
  }
  return null;
};

/** All live events across the world right now. */
export const allLiveEvents = (now = new Date()) =>
  Object.values(EVENTS)
    .map((e) => isLive(e, now))
    .filter(Boolean);
