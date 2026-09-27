import type { PublicCity, PublicDistrict } from "@3dworld/contracts";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { cityClock, cityHour, partOfDay } from "../../lib/cityTime.ts";
import { connectionAtom, paletteOpenAtom, panelAtom } from "../../state/store.ts";

const CONNECTION_LABEL = {
  idle: "Offline",
  connecting: "Connecting…",
  online: "Live",
  offline: "Reconnecting…",
} as const;

export const TopBar = ({ city, district }: { city: PublicCity; district: PublicDistrict }) => {
  const connection = useAtomValue(connectionAtom);
  const setPanel = useSetAtom(panelAtom);
  const setPalette = useSetAtom(paletteOpenAtom);
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="panel pointer-events-auto flex items-center gap-3 px-3 py-2">
      <button
        type="button"
        onClick={() => setPanel("map")}
        className="tap flex items-center gap-2 rounded-xl px-2 text-left hover:bg-panel-2"
        aria-label={`${city.name}, ${district.name}. Open the world map`}
      >
        <span aria-hidden="true" className="text-xl">
          {city.emoji}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-semibold">{city.name}</span>
          <span className="text-xs text-muted">{district.name}</span>
        </span>
      </button>
      <p className="text-sm text-muted">
        <time>{cityClock(city.timezone)}</time> · {partOfDay(cityHour(city.timezone))}
      </p>
      <span className="ml-auto flex items-center gap-2 text-sm" role="status">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${connection === "online" ? "bg-teal" : "bg-amber animate-pulse"}`}
        />
        {CONNECTION_LABEL[connection]}
      </span>
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="tap rounded-xl border border-line px-3 text-sm text-muted hover:text-text"
        aria-keyshortcuts="Meta+K Control+K"
      >
        Search <kbd className="ml-1 rounded bg-panel-2 px-1">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setPanel("me")}
        className="tap rounded-xl border border-line px-3 text-sm hover:border-muted"
      >
        Me
      </button>
    </header>
  );
};
