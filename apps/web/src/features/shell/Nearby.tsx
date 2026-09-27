import { type CityDetail, localFrame, type PublicDistrict } from "@3dworld/contracts";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useReducer } from "react";
import { approachPoint } from "../../lib/approach.ts";
import {
  composerDraftAtom,
  playersAtom,
  poses,
  selfPose,
  walkTargetAtom,
} from "../../state/store.ts";

type Row = {
  id: string;
  kind: "resident" | "place" | "player";
  name: string;
  detail: string;
  x: number;
  z: number;
};

const compass = (dx: number, dz: number) => {
  const deg = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;
  return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][
    Math.round(deg / 45) % 8
  ];
};

/**
 * Keyboard-first way to reach everything in the scene: a list sorted by
 * distance, with walk and ask actions. Same targets the 3D view offers.
 */
export const Nearby = ({ detail, district }: { detail: CityDetail; district: PublicDistrict }) => {
  const setWalk = useSetAtom(walkTargetAtom);
  const setDraft = useSetAtom(composerDraftAtom);
  const players = useAtomValue(playersAtom);
  // Distances change as people move; refresh the list every 1.5 s.
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const id = setInterval(refresh, 1500);
    return () => clearInterval(id);
  }, []);

  const frame = localFrame(district.origin);
  const me = selfPose.current;
  const rows: Row[] = [
    ...detail.places
      .filter((p) => p.districtId === district.id)
      .map((p) => ({
        id: p.id,
        kind: "place" as const,
        name: `${p.emoji} ${p.name}`,
        detail: p.blurb,
        ...approachPoint(p, frame),
      })),
    ...detail.residents
      .filter((r) => poses.has(r.id))
      .map((r) => {
        const pose = poses.get(r.id)!.to;
        return {
          id: r.id,
          kind: "resident" as const,
          name: r.name,
          detail: r.bio,
          x: pose.x,
          z: pose.z,
        };
      }),
    ...[...players.values()].flatMap((p) => {
      const pose = poses.get(p.id)?.to;
      return pose
        ? [
            {
              id: p.id,
              kind: "player" as const,
              name: p.name,
              detail: "Visitor",
              x: pose.x,
              z: pose.z,
            },
          ]
        : [];
    }),
  ];
  const sorted = rows
    .map((r) => ({ ...r, dist: Math.hypot(r.x - me.x, r.z - me.z) }))
    .sort((a, b) => a.dist - b.dist);

  return (
    <div className="h-full overflow-y-auto pr-1">
      <ul className="space-y-2" aria-label="People and places near you, closest first">
        {sorted.map((r) => (
          <li key={`${r.kind}:${r.id}`} className="rounded-xl bg-panel-2 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{r.name}</span>
              <span className="shrink-0 text-sm text-muted">
                {Math.round(r.dist)} m {r.dist > 3 ? compass(r.x - me.x, r.z - me.z) : "here"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">{r.detail}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="tap rounded-lg border border-line px-3 text-sm hover:border-muted"
                onClick={() => {
                  const back = 2.5; // stop just in front, not on top of them
                  const dx = me.x - r.x;
                  const dz = me.z - r.z;
                  const len = Math.hypot(dx, dz) || 1;
                  setWalk({
                    x: r.x + (dx / len) * back,
                    z: r.z + (dz / len) * back,
                    label: r.name,
                  });
                }}
              >
                Walk here
              </button>
              {r.kind === "resident" ? (
                <button
                  type="button"
                  className="tap rounded-lg bg-teal/15 px-3 text-sm text-teal ring-1 ring-teal/40"
                  onClick={() => {
                    setDraft(`@${r.name} `);
                    document.getElementById("composer-input")?.focus();
                  }}
                >
                  Ask {r.name}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
