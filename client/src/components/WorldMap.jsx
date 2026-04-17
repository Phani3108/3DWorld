import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { useState } from "react";
import {
  citiesAtom,
  cityAtom,
  worldMapOpenAtom,
  socket,
  transitionStartTime,
  roomIDAtom,
  roomTransitionAtom,
} from "./SocketManager";

/**
 * WorldMap — modal portal that lets players teleport between the 7 cities.
 *
 * Data comes from `citiesAtom` (populated at `welcome`). Clicking a pin emits
 * `switchRoom` with the city's roomId, reusing the existing transition flow.
 */
export const WorldMap = () => {
  const [open, setOpen] = useAtom(worldMapOpenAtom);
  const [cities] = useAtom(citiesAtom);
  const [currentCity] = useAtom(cityAtom);
  const [, setRoomID] = useAtom(roomIDAtom);
  const [, setRoomTransition] = useAtom(roomTransitionAtom);
  const [hovered, setHovered] = useState(null);

  if (!open) return null;

  const list = cities ? Object.values(cities) : [];
  // Default centre + min/max so even without data the picker renders.
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const hoveredCity = hovered ? cities?.[hovered] : null;

  const travelTo = (city) => {
    if (!city) return;
    const roomId = city.roomId || `city_${city.id}`;
    transitionStartTime.current = Date.now();
    setRoomTransition({
      active: true,
      from: currentCity?.id || null,
      to: roomId,
      startedAt: transitionStartTime.current,
    });
    setRoomID(roomId);
    socket.emit("switchRoom", roomId);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] grid place-items-center p-4"
        onClick={() => setOpen(false)}
      >
        <motion.div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0f172a] border border-sky-400/30 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden"
          initial={{ scale: 0.92, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-sky-400/15">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🌍</span> World Map
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pick a city to travel there. Everyone's world is the same — you'll meet whoever is there right now.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-300 text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Flat stylised map. Pins positioned from each city's `mapPosition`. */}
          <div className="relative">
            <div
              className="relative mx-auto my-5 rounded-xl border border-slate-800 overflow-hidden"
              style={{
                width: "100%",
                aspectRatio: "2.2 / 1",
                background:
                  "radial-gradient(ellipse at 30% 40%, #1e293b 0%, #0f172a 60%, #020617 100%)",
              }}
            >
              {/* Dotted continent hint — purely decorative */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 45" preserveAspectRatio="none">
                <defs>
                  <pattern id="dots" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
                    <circle cx="0.8" cy="0.8" r="0.22" fill="#38bdf8" />
                  </pattern>
                </defs>
                <path d="M3,18 Q12,6 28,9 T52,13 Q65,16 78,12 T95,15 L95,40 L3,40 Z" fill="url(#dots)" />
              </svg>

              {/* Pins */}
              {list.map((c) => {
                const isHere = currentCity?.id === c.id;
                const isHover = hovered === c.id;
                const left = `${(c.mapPosition?.x ?? 0.5) * 100}%`;
                const top  = `${(c.mapPosition?.y ?? 0.5) * 100}%`;
                return (
                  <button
                    key={c.id}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered((h) => (h === c.id ? null : h))}
                    onClick={() => travelTo(c)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left, top }}
                  >
                    {/* Ripple ring */}
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        boxShadow: `0 0 0 0 ${c.palette?.accent || "#38bdf8"}`,
                        background: isHere ? (c.palette?.accent || "#38bdf8") + "44" : "transparent",
                      }}
                    />
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-125"
                      style={{
                        background: c.palette?.accent || "#38bdf8",
                        border: `2px solid ${isHere ? "#fff" : "#0f172a"}`,
                        boxShadow: isHover ? `0 0 24px ${c.palette?.accent || "#38bdf8"}` : `0 2px 8px rgba(0,0,0,0.6)`,
                      }}
                    >
                      {c.emoji}
                    </div>
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] font-semibold text-white whitespace-nowrap px-1.5 py-0.5 rounded bg-black/60 pointer-events-none"
                      style={{ opacity: isHover ? 1 : 0.7 }}
                    >
                      {c.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hovered city preview card */}
            <div className="px-6 pb-5 min-h-[110px]">
              {hoveredCity ? (
                <motion.div
                  key={hoveredCity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 bg-slate-900 rounded-xl p-4 border"
                  style={{ borderColor: `${hoveredCity.palette?.accent}55` }}
                >
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl shrink-0"
                    style={{ background: `${hoveredCity.palette?.accent}22` }}
                  >
                    {hoveredCity.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{hoveredCity.name}</h3>
                      <span className="text-xs text-gray-500">{hoveredCity.country}</span>
                      {currentCity?.id === hoveredCity.id && (
                        <span className="text-[10px] bg-sky-500/25 text-sky-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You are here</span>
                      )}
                      {hoveredCity.nbCharacters > 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded">
                          👥 {hoveredCity.nbCharacters}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{hoveredCity.tagline}</p>
                    {hoveredCity.menu && hoveredCity.menu.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 mr-1">Local:</span>
                        {hoveredCity.menu.slice(0, 4).map((m) => (
                          <span key={m} className="text-[10px] bg-slate-800 text-gray-300 px-1.5 py-0.5 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => travelTo(hoveredCity)}
                    className="shrink-0 self-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
                    style={{ background: hoveredCity.palette?.accent || "#38bdf8" }}
                  >
                    Travel →
                  </button>
                </motion.div>
              ) : (
                <div className="text-xs text-gray-500 text-center py-6">
                  Hover a pin to preview the city · click to travel
                </div>
              )}
            </div>

            {/* Fallback list view for when the catalog is still loading */}
            {list.length === 0 && (
              <div className="px-6 pb-6 text-center text-gray-500 text-sm">
                Loading cities…
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorldMap;
