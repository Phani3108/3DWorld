import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { Prop } from "./props/Prop";
import { useGrid } from "../hooks/useGrid";

/**
 * Pitstops — Phase 10D.
 *
 * Renders the city's pitstop list (from `map.pitstops`) as:
 *   • A small prop (newspaper stand / bench / fruit cart / etc.) at the
 *     pitstop's grid position. Reuses the existing Prop registry so no
 *     new geometry is needed.
 *   • A subtle Html chip floating above with the theme label so a
 *     player approaching can read what the spot is.
 *
 * The actual proximity trigger lives server-side in socketHandlers.js's
 * move handler. Server emits `pitstopPass` to the local player, which
 * SocketManager relays into the activity feed (set up below).
 */

export const Pitstops = ({ pitstops = [], accent = "#fb7185" }) => {
  const { gridToVector3 } = useGrid();
  const items = useMemo(() => Array.isArray(pitstops) ? pitstops : [], [pitstops]);
  if (items.length === 0) return null;
  return (
    <group>
      {items.map((p) => {
        const v = gridToVector3(p.position);
        return (
          <group key={p.id} position={[v.x, 0, v.z]}>
            {p.prop && <Prop type={p.prop} gridPosition={[0, 0]} accent={accent} />}
            {/* Theme chip — small, drei Html, sits ~2 m above the prop */}
            <Html
              position={[0, 1.6, 0]}
              center
              distanceFactor={10}
              zIndexRange={[1, 0]}
              style={{ pointerEvents: "none" }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  color: "#fbbf24",
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(251,191,36,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                🛑 {p.theme}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

export default Pitstops;
