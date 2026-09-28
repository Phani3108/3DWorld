import { type WorldSnapshot, worldMapPosition } from "@3dworld/contracts";
import { useAtom } from "jotai";
import { cityClock } from "../../lib/cityTime.ts";
import { placeAtom } from "../../state/store.ts";

/** World map + travel. Cities are pinned at their real coordinates. */
export const WorldMap = ({ world }: { world: WorldSnapshot }) => {
  const [place, setPlace] = useAtom(placeAtom);
  return (
    <div className="h-full overflow-y-auto pr-1">
      <div
        className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-[#14203a] ring-1 ring-line"
        aria-hidden="true"
      >
        {/* graticule */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={`v${i}`}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${(i * 100) / 6}%` }}
          />
        ))}
        {[1, 2].map((i) => (
          <div
            key={`h${i}`}
            className="absolute right-0 left-0 h-px bg-white/5"
            style={{ top: `${(i * 100) / 3}%` }}
          />
        ))}
        {world.cities.map((c) => {
          const p = worldMapPosition(c.center);
          const here = place?.cityId === c.id;
          return (
            <div
              key={c.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${here ? "h-3 w-3 bg-amber" : "h-2 w-2 bg-teal"}`}
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
              title={c.name}
            />
          );
        })}
      </div>
      <ul className="mt-3 space-y-2" aria-label="Travel">
        {world.cities.map((c) => (
          <li key={c.id} className="rounded-xl bg-panel-2 p-3">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">
                <span aria-hidden="true">{c.emoji}</span> {c.name}
              </span>
              <span className="text-sm text-muted">{cityClock(c.timezone)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.districts.map((d) => {
                const here = place?.districtId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={here}
                    aria-current={here ? "location" : undefined}
                    onClick={() => setPlace({ cityId: c.id, districtId: d.id })}
                    className="tap rounded-lg border border-line px-3 text-sm hover:border-muted disabled:border-amber disabled:text-amber"
                  >
                    {here ? `You're in ${d.name}` : `Go to ${d.name}`}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
