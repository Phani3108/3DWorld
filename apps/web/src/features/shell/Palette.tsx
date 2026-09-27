import {
  type CityDetail,
  localFrame,
  type PublicDistrict,
  type WorldSnapshot,
} from "@3dworld/contracts";
import { Command } from "cmdk";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { approachPoint } from "../../lib/approach.ts";
import {
  composerDraftAtom,
  paletteOpenAtom,
  panelAtom,
  placeAtom,
  walkTargetAtom,
} from "../../state/store.ts";

const item = "tap flex cursor-pointer items-center rounded-lg px-3 aria-selected:bg-panel-2";

/** ⌘K: travel, walk to a place, ask a resident, open a panel. */
export const Palette = ({
  world,
  detail,
  district,
}: {
  world: WorldSnapshot;
  detail: CityDetail;
  district: PublicDistrict;
}) => {
  const [open, setOpen] = useAtom(paletteOpenAtom);
  const setPlace = useSetAtom(placeAtom);
  const setWalk = useSetAtom(walkTargetAtom);
  const setDraft = useSetAtom(composerDraftAtom);
  const setPanel = useSetAtom(panelAtom);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const frame = localFrame(district.origin);
  const close = () => setOpen(false);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search places, people and cities"
      className="panel fixed top-24 left-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 p-2"
      overlayClassName="fixed inset-0 z-40 bg-ink/60"
    >
      <Command.Input
        placeholder="Where to? Who to ask?"
        className="tap w-full rounded-xl bg-ink px-4 text-lg outline-none"
      />
      <Command.List className="mt-2 max-h-[50vh] overflow-y-auto">
        <Command.Empty className="px-3 py-2 text-muted">Nothing matches.</Command.Empty>
        <Command.Group heading="Ask someone here" className="text-xs text-muted">
          {detail.residents
            .filter((r) =>
              detail.places.some((p) => p.id === r.homePlaceId && p.districtId === district.id),
            )
            .map((r) => (
              <Command.Item
                key={r.id}
                value={`ask ${r.name} ${r.bio}`}
                className={item}
                onSelect={() => {
                  setDraft(`@${r.name} `);
                  close();
                  setTimeout(() => document.getElementById("composer-input")?.focus(), 0);
                }}
              >
                Ask <span className="mx-1 font-semibold text-text">{r.name}</span> — {r.bio}
              </Command.Item>
            ))}
        </Command.Group>
        <Command.Group heading="Walk to" className="text-xs text-muted">
          {detail.places
            .filter((p) => p.districtId === district.id)
            .map((p) => (
              <Command.Item
                key={p.id}
                value={`walk ${p.name}`}
                className={item}
                onSelect={() => {
                  setWalk({ ...approachPoint(p, frame), label: p.name });
                  close();
                }}
              >
                <span aria-hidden="true" className="mr-2">
                  {p.emoji}
                </span>
                {p.name}
              </Command.Item>
            ))}
        </Command.Group>
        <Command.Group heading="Travel" className="text-xs text-muted">
          {world.cities.flatMap((c) =>
            c.districts.map((d) => (
              <Command.Item
                key={d.id}
                value={`travel ${c.name} ${d.name}`}
                className={item}
                onSelect={() => {
                  setPlace({ cityId: c.id, districtId: d.id });
                  close();
                }}
              >
                <span aria-hidden="true" className="mr-2">
                  {c.emoji}
                </span>
                {c.name} · {d.name}
              </Command.Item>
            )),
          )}
        </Command.Group>
        <Command.Group heading="Panels" className="text-xs text-muted">
          {(["chats", "nearby", "map", "me"] as const).map((p) => (
            <Command.Item
              key={p}
              value={`open ${p}`}
              className={item}
              onSelect={() => {
                setPanel(p);
                close();
              }}
            >
              Open {p}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
