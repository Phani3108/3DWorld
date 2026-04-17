import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { coinsAtom, charactersAtom, userAtom } from "./SocketManager";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

/**
 * VehiclePicker — wheel/grid of vehicles. Clicking one POSTs to
 * /api/v1/users/:id/vehicle which charges coins + broadcasts the change.
 */
export const VehiclePicker = ({ open, onClose }) => {
  const [vehicles, setVehicles] = useState(null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const [coins, setCoins] = useAtom(coinsAtom);
  const [characters] = useAtom(charactersAtom);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    if (!open) return;
    fetch(`${SERVER_URL}/api/v1/vehicles`)
      .then((r) => r.json())
      .then(setVehicles)
      .catch(() => {});
  }, [open]);

  const self = characters.find((c) => c.id === user);
  const currentVehicleId = self?.vehicleId || "walk";

  const pick = async (v) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setErr("Sign in first."); return; }
    if (v.id !== currentVehicleId && v.coinPerTrip > 0 && coins < v.coinPerTrip) {
      setErr(`Need ${v.coinPerTrip} coins, you have ${coins}.`);
      return;
    }
    setBusy(v.id); setErr(null);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/v1/users/${encodeURIComponent(userId)}/vehicle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId: v.id }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      if (typeof data.coins === "number") setCoins(data.coins);
      onClose?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full right-0 mb-3 w-72 bg-[#1a1a2e] border border-amber-400/30 rounded-2xl shadow-2xl overflow-hidden z-50 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2.5 border-b border-amber-400/15 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Pick your ride</h3>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 text-xs">×</button>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {!vehicles ? (
            <div className="col-span-2 text-xs text-gray-500 text-center py-4">Loading…</div>
          ) : (
            vehicles.map((v) => {
              const selected = v.id === currentVehicleId;
              const affordable = v.coinPerTrip === 0 || coins >= v.coinPerTrip;
              return (
                <button
                  key={v.id}
                  onClick={() => pick(v)}
                  disabled={busy === v.id || !affordable}
                  className={`group text-left rounded-xl p-2.5 border transition-all ${
                    selected
                      ? "border-amber-400 bg-amber-500/15"
                      : affordable
                      ? "border-slate-700 bg-slate-900 hover:border-slate-500"
                      : "border-slate-800 bg-slate-900 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl leading-none">{v.emoji}</span>
                    <span className="text-[10px] text-amber-300 font-semibold">
                      {v.coinPerTrip > 0 ? `🪙 ${v.coinPerTrip}` : "free"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white">{v.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">×{v.speedMul} speed</div>
                  {selected && (
                    <div className="mt-1 text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                      Current
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
        {err && (
          <div className="bg-rose-500/20 text-rose-300 text-xs px-4 py-2 border-t border-rose-500/30">
            {err}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VehiclePicker;
