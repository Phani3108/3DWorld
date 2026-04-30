import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selfPathAtom, mapAtom, charactersAtom, userAtom } from "./SocketManager";
import { speedFor, surfaceAtClient, surfaceLabel } from "../lib/movementSpeed";

/**
 * ETAChip — Phase 10I.
 *
 * Plain DOM chip pinned to the top-centre of the screen showing:
 *   • Vehicle emoji
 *   • Estimated seconds to arrival
 *   • Surface label (main road / bike lane / sidewalk / off-road)
 *
 * ETA = sum of remaining waypoint segments / speedFor(vehicle, surface).
 *
 * Polls the path atom directly and recomputes via setInterval at 4 Hz —
 * cheaper than running on every frame and the user can't tell the diff.
 */
const VEHICLE_EMOJI = {
  walk:  "🚶",
  cycle: "🚲",
  auto:  "🛺",
  bike:  "🏍️",
  car:   "🚗",
};

export const ETAChip = () => {
  const [path]      = useAtom(selfPathAtom);
  const [mapData]   = useAtom(mapAtom);
  const [characters]= useAtom(charactersAtom);
  const [userId]    = useAtom(userAtom);
  const [tick, setTick] = useState(0);

  // 4 Hz tick — recomputes on every interval and on path/map change.
  useEffect(() => {
    if (!Array.isArray(path) || path.length < 2) return;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [path]);

  if (!Array.isArray(path) || path.length < 2) return null;

  // Sum remaining segment lengths.
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += path[i].distanceTo(path[i - 1]);
  }
  // Identify the local player's vehicle (and surface)
  const me = (characters || []).find((c) => c.id === userId);
  const vehicleId = me?.vehicleId || "walk";

  const segs = mapData?.roads?.segments;
  const div  = mapData?.gridDivision || 2;
  const first = path[0];
  const surface = segs && first ? surfaceAtClient(segs, [first.x * div, first.z * div]) : null;

  const speed = speedFor(vehicleId, surface);
  const seconds = Math.max(1, Math.round(total / Math.max(0.1, speed)));
  const emoji = VEHICLE_EMOJI[vehicleId] || "🧭";

  return (
    <div
      // Re-render-friendly key to force the chip to swap out cleanly when the
      // numbers change. Hint to the browser to compose this layer.
      style={{
        position: "fixed",
        top: 76,
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 90,
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(251,191,36,0.45)",
        color: "#fbbf24",
        padding: "6px 12px",
        borderRadius: 999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12,
        fontWeight: 700,
        boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
      data-tick={tick}
    >
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span>{seconds}s</span>
      <span style={{ opacity: 0.55, fontWeight: 500 }}>· {surfaceLabel(surface)}</span>
    </div>
  );
};

export default ETAChip;
