import type { WorldSnapshot } from "@3dworld/contracts";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { Tabs } from "radix-ui";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.ts";
import { useDistrictGeometry } from "../../lib/districtGeometry.ts";
import { loadScene } from "../../lib/loadScene.ts";
import { connect, disconnect, joinDistrict } from "../../lib/realtime.ts";
import { narrationAtom, panelAtom, placeAtom, sessionAtom } from "../../state/store.ts";
import { ChatLog } from "./ChatLog.tsx";
import { Composer } from "./Composer.tsx";
import { MePanel } from "./MePanel.tsx";
import { Nearby } from "./Nearby.tsx";
import { Palette } from "./Palette.tsx";
import { TopBar } from "./TopBar.tsx";
import { WorldMap } from "./WorldMap.tsx";

const Scene = lazy(() => loadScene().then((m) => ({ default: m.Scene })));

const TABS = [
  ["chats", "Chats"],
  ["nearby", "Nearby"],
  ["map", "Map"],
  ["me", "Me"],
] as const;

export const WorldShell = ({ world }: { world: WorldSnapshot }) => {
  const session = useAtomValue(sessionAtom);
  const [place, setPlace] = useAtom(placeAtom);
  const [panel, setPanel] = useAtom(panelAtom);
  const narration = useAtomValue(narrationAtom);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  const fallbackCity = world.cities[0];
  const cityId = place?.cityId ?? fallbackCity?.id ?? "hyderabad";
  const city = world.cities.find((c) => c.id === cityId) ?? fallbackCity;
  const district =
    city?.districts.find((d) => d.id === place?.districtId) ??
    city?.districts.find((d) => d.id === city.defaultDistrictId);
  const detail = useQuery({ queryKey: ["city", cityId], queryFn: () => api.city(cityId) });
  const map = useDistrictGeometry(district);

  useEffect(() => {
    if (!session) return;
    connect(session.token, session.user.id);
    return () => disconnect();
  }, [session]);

  useEffect(() => {
    if (!district || !city) return;
    if (place?.districtId !== district.id) setPlace({ cityId: city.id, districtId: district.id });
    let cancelled = false;
    setJoined(null);
    setJoinError(null);
    joinDistrict(district.id)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setJoined(res.room.roomId);
        else setJoinError(res.error);
      })
      .catch(
        (err: unknown) => !cancelled && setJoinError(err instanceof Error ? err.message : "failed"),
      );
    return () => {
      cancelled = true;
    };
  }, [district, city, place?.districtId, setPlace]);

  const residents = useMemo(
    () =>
      (detail.data?.residents ?? []).filter((r) =>
        detail.data?.places.some((p) => p.id === r.homePlaceId && p.districtId === district?.id),
      ),
    [detail.data, district?.id],
  );
  const residentNames = useMemo(() => new Map(residents.map((r) => [r.id, r.name])), [residents]);

  if (!city || !district) return <p className="p-6">This city has no districts yet.</p>;

  return (
    <div className="relative h-full overflow-hidden">
      <main className="absolute inset-0" aria-label={`3D view of ${district.name}, ${city.name}`}>
        {detail.data && joined ? (
          <Suspense fallback={<p className="p-6 text-muted">Loading the city…</p>}>
            <Scene key={joined} detail={detail.data} district={district} />
          </Suspense>
        ) : (
          <div className="grid h-full place-items-center text-muted">
            {joinError
              ? `Couldn't enter ${district.name} (${joinError}).`
              : `Arriving in ${district.name}…`}
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {narration}
        </p>
      </main>

      <div className="pointer-events-none absolute inset-x-3 top-3">
        <TopBar city={city} district={district} />
      </div>

      <aside
        aria-label="Journal"
        className="panel absolute top-24 right-3 bottom-24 flex w-[min(380px,calc(100vw-1.5rem))] flex-col p-3"
        hidden={panel === null}
      >
        <Tabs.Root
          value={panel ?? "chats"}
          onValueChange={(v) => setPanel(v as (typeof TABS)[number][0])}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex items-center gap-1">
            <Tabs.List aria-label="Journal sections" className="flex flex-1 gap-1">
              {TABS.map(([id, label]) => (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className="tap flex-1 rounded-lg text-sm text-muted data-[state=active]:bg-panel-2 data-[state=active]:text-text"
                >
                  {label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="tap rounded-lg text-muted hover:text-text"
              aria-label="Close journal"
            >
              ✕
            </button>
          </div>
          <Tabs.Content value="chats" className="mt-3 min-h-0 flex-1">
            <ChatLog residentNames={residentNames} />
          </Tabs.Content>
          <Tabs.Content value="nearby" className="mt-3 min-h-0 flex-1">
            {detail.data ? <Nearby detail={detail.data} district={district} /> : null}
          </Tabs.Content>
          <Tabs.Content value="map" className="mt-3 min-h-0 flex-1">
            <WorldMap world={world} />
          </Tabs.Content>
          <Tabs.Content value="me" className="mt-3 min-h-0 flex-1">
            <MePanel />
          </Tabs.Content>
        </Tabs.Root>
      </aside>
      {panel === null ? (
        <button
          type="button"
          onClick={() => setPanel("chats")}
          className="panel tap absolute top-24 right-3 px-4 text-sm"
        >
          Open journal
        </button>
      ) : null}

      <div className="absolute inset-x-3 bottom-3 mx-auto max-w-3xl">
        <Composer residents={residents} />
        <p className="mt-1 text-center text-[11px] text-muted">
          {map.data
            ? "Streets and mapped buildings from OpenStreetMap; unmapped buildings and heights are estimated"
            : "Street layout is a stand-in until map data is compiled"}{" "}
          · Residents are AI characters · {district.attribution.join(" · ")}
        </p>
      </div>

      {detail.data ? <Palette world={world} detail={detail.data} district={district} /> : null}
    </div>
  );
};
