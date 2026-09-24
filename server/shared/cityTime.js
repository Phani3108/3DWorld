/**
 * City-local clock.
 *
 * Every "what time is it here?" question in the world — live events,
 * resident small talk, the LLM's live context — must use the city's own
 * timezone (cityCatalog `timezone`), never the server's clock. The demo
 * server runs in UTC, so "Sunday lunch in Hyderabad" used to start at
 * 17:30 IST.
 */

import { getCity } from "./cityCatalog.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MINUTES_PER_WEEK = 7 * 24 * 60;
const formatters = new Map();

const formatterFor = (timeZone) => {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, f);
  }
  return f;
};

/** IANA timezone for a city (UTC for unknown ids). */
export const cityTimeZone = (cityId) => getCity(cityId)?.timezone || "UTC";

/**
 * Local wall-clock parts for a city.
 * @returns {{ dayOfWeek: number, weekday: string, hour: number, minute: number, timeZone: string }}
 */
export const cityLocalTime = (cityId, now = new Date()) => {
  const timeZone = cityTimeZone(cityId);
  const parts = {};
  for (const p of formatterFor(timeZone).formatToParts(now)) parts[p.type] = p.value;
  return {
    dayOfWeek: WEEKDAYS.indexOf(parts.weekday),
    weekday: parts.weekday,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    timeZone,
  };
};

/** "morning" | "afternoon" | "evening" | "night" | "late night" */
export const partOfDay = (hour) => {
  if (hour < 5) return "late night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
};

/** "Tue 18:42" in the city's local time. */
export const formatCityClock = (cityId, now = new Date()) => {
  const t = cityLocalTime(cityId, now);
  return `${t.weekday} ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
};

/**
 * Is a weekly window live right now in the city's local time?
 * Handles windows that cross midnight or the Saturday→Sunday wrap.
 * @returns {number|null} ms remaining when live, else null
 */
export const weeklyWindowRemainingMs = (cityId, { dayOfWeek, startHour, durationHours }, now = new Date()) => {
  const t = cityLocalTime(cityId, now);
  const nowMin = t.dayOfWeek * 1440 + t.hour * 60 + t.minute;
  const startMin = dayOfWeek * 1440 + startHour * 60;
  const lengthMin = durationHours * 60;
  let elapsed = nowMin - startMin;
  if (elapsed < 0) elapsed += MINUTES_PER_WEEK;
  if (elapsed >= lengthMin) return null;
  return (lengthMin - elapsed) * 60_000;
};
