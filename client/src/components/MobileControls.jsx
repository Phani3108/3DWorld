import { useEffect, useRef, useCallback } from "react";
import { useAtom } from "jotai";
import nipplejs from "nipplejs";
import { socket, userAtom, mapAtom, selfLivePosition } from "./SocketManager";
import { buildModeAtom, shopModeAtom } from "./UI";
import { isMobileAtom } from "../hooks/useMobile";

const MOVE_INTERVAL = 250; // ms between move commands
const MOVE_DISTANCE = 3;   // grid cells ahead per tick

export const MobileControls = () => {
  const [isMobile] = useAtom(isMobileAtom);
  const [user] = useAtom(userAtom);
  const [map] = useAtom(mapAtom);
  const [buildMode] = useAtom(buildModeAtom);
  const [shopMode] = useAtom(shopModeAtom);

  const joystickRef = useRef(null);
  const joystickZoneRef = useRef(null);
  const moveIntervalRef = useRef(null);
  const currentAngle = useRef(null);

  const emitMove = useCallback(() => {
    if (!user || !map || buildMode || shopMode) return;
    const angle = currentAngle.current;
    if (angle === null) return;

    // Get current position from selfLivePosition (set by Avatar.jsx)
    const pos = selfLivePosition.current;
    if (!pos) return;

    const [gx, gz] = pos;
    const rad = (angle * Math.PI) / 180;
    // nipplejs angle: 0=right, 90=up, 180=left, 270=down
    // In our grid: +x=right, +z=down (Three.js top-down)
    const targetX = Math.round(gx + Math.cos(rad) * MOVE_DISTANCE);
    const targetZ = Math.round(gz - Math.sin(rad) * MOVE_DISTANCE);

    // Clamp to map bounds
    const clampedX = Math.max(0, Math.min(Math.floor(map.size[0] * map.gridDivision) - 1, targetX));
    const clampedZ = Math.max(0, Math.min(Math.floor(map.size[1] * map.gridDivision) - 1, targetZ));

    socket.emit("move", [gx, gz], [clampedX, clampedZ]);
  }, [user, map, buildMode, shopMode]);

  useEffect(() => {
    if (!isMobile || !joystickZoneRef.current) return;

    const manager = nipplejs.create({
      zone: joystickZoneRef.current,
      mode: "static",
      position: { left: "60px", bottom: "60px" },
      size: 100,
      color: "rgba(255,255,255,0.35)",
      fadeTime: 0,
    });

    joystickRef.current = manager;

    manager.on("move", (_evt, data) => {
      if (data.angle) {
        currentAngle.current = data.angle.degree;
      }
    });

    manager.on("start", () => {
      // Start emitting moves at interval
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = setInterval(emitMove, MOVE_INTERVAL);
    });

    manager.on("end", () => {
      currentAngle.current = null;
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
    });

    return () => {
      manager.destroy();
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
    };
  }, [isMobile, emitMove]);

  if (!isMobile) return null;

  return (
    <>
      {/* Joystick zone — bottom-left, above nav bar */}
      <div
        ref={joystickZoneRef}
        className="fixed bottom-20 left-0 z-[12] pointer-events-auto"
        style={{
          width: 150,
          height: 150,
          touchAction: "none",
        }}
      />

      {/* Zoom buttons — bottom-right */}
      {!buildMode && !shopMode && (
        <div className="fixed bottom-24 right-3 z-[12] flex flex-col gap-2 pointer-events-auto">
          <button
            className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center text-xl font-bold text-gray-600 active:bg-gray-100"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              // Dispatch a synthetic zoom-in action by accessing the Experience zoom ref via custom event
              window.dispatchEvent(new CustomEvent("mobile-zoom", { detail: { delta: -3 } }));
            }}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center text-xl font-bold text-gray-600 active:bg-gray-100"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("mobile-zoom", { detail: { delta: 3 } }));
            }}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      )}
    </>
  );
};

export default MobileControls;
