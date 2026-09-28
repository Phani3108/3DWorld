/** Local wall-clock helpers for a city's IANA time zone. */

export const cityClock = (timeZone: string, date = new Date()) =>
  new Intl.DateTimeFormat(undefined, { timeZone, hour: "2-digit", minute: "2-digit" }).format(date);

export const cityHour = (timeZone: string, date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
};

export const partOfDay = (hour: number) =>
  hour < 5
    ? "night"
    : hour < 12
      ? "morning"
      : hour < 17
        ? "afternoon"
        : hour < 21
          ? "evening"
          : "night";
