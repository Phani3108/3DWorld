import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchTravelTickets,
  buyTravelTicket,
  fetchUserReputation,
} from "../lib/api";
import { citiesAtom, cityAtom, coinsAtom, switchRoom } from "./SocketManager";

/**
 * TravelPanel — Phase 9D surface.
 *
 * Lists the 7 cities with current price (scaled by destination reputation),
 * any reputation gates, the user's existing rep tier in each city, and a
 * one-tap buy button that on success switches the player into the city
 * room. Reputation discount: -5 coins per 50 rep, floor at 5 coins.
 */
export const travelOpenAtom = atom(false);

export const TravelPanel = () => {
  const [open, setOpen] = useAtom(travelOpenAtom);
  const [cities] = useAtom(citiesAtom);
  const [currentCity] = useAtom(cityAtom);
  const [coins, setCoins] = useAtom(coinsAtom);

  const [tickets, setTickets] = useState(null);
  const [rep, setRep] = useState({ scores: [], tiers: [] });
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const userId = localStorage.getItem("3dworld_user_id");
    Promise.all([
      fetchTravelTickets().catch(() => null),
      userId ? fetchUserReputation(userId).catch(() => null) : Promise.resolve(null),
    ]).then(([t, r]) => {
      if (cancelled) return;
      if (t) setTickets(t);
      if (r) setRep(r);
    });
    return () => { cancelled = true; };
  }, [open]);

  const repFor = (cityId) => {
    const m = rep.scores?.find?.((s) => s.cityId === cityId);
    return m ? m.score : 0;
  };

  const computePrice = (cityId) => {
    const t = tickets || { baseCoins: 20, reputationDiscountPer50: 5, minCoins: 5 };
    const score = repFor(cityId);
    const discount = Math.floor(score / 50) * (t.reputationDiscountPer50 || 5);
    return Math.max(t.minCoins || 5, (t.baseCoins || 20) - discount);
  };

  const gateFor = (cityId) => {
    if (!Array.isArray(tickets?.reputationRequiredFor)) return null;
    return tickets.reputationRequiredFor.find((g) => g.cityId === cityId) || null;
  };

  const handleBuy = async (cityId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) {
      setMsg({ type: "error", text: "Please reload and pick a name first." });
      return;
    }
    setBusyId(cityId);
    try {
      const res = await buyTravelTicket(userId, cityId);
      setCoins(res.coins);
      setMsg({ type: "ok", text: `Off to ${cityId} — ${res.coinsSpent} 🪙 spent.` });
      // Switch the active room → the city's main room
      if (res.roomId) switchRoom(res.roomId);
      setTimeout(() => { setMsg(null); setOpen(false); }, 800);
    } catch (e) {
      // Server returns specific reasons. Normalise the common ones.
      let raw = e.message || "Trip failed";
      if (raw.includes("insufficient_reputation")) {
        raw = "You don't have enough reputation in that city yet — go ask around.";
      } else if (raw.includes("insufficient_coins")) {
        raw = "Not enough coins for that ticket.";
      }
      setMsg({ type: "error", text: raw });
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;

  // Render order: current city last (or hidden), then alphabetical.
  const list = Object.values(cities || {})
    .filter((c) => c.id && c.id !== currentCity?.id)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <AnimatePresence>
      <motion.div
        key="travel"
        className="fixed inset-0 z-[150] flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full sm:w-[600px] max-w-[calc(100vw-2rem)] max-h-[82vh] overflow-y-auto bg-[#1a1a2e] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-sky-400/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1a2e] border-b border-[#2a2a3e]">
            <div>
              <h2 className="text-lg font-bold text-white">✈️ Travel</h2>
              <div className="text-[11px] text-gray-400">
                Reputation lowers fares · two cities are rep-gated
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-300 font-semibold">🪙 {coins ?? 0}</span>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
                aria-label="Close"
              >×</button>
            </div>
          </div>

          <div className="px-5 py-4 space-y-2">
            {list.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Loading cities…
              </div>
            )}
            {list.map((c) => {
              const score    = repFor(c.id);
              const price    = computePrice(c.id);
              const gate     = gateFor(c.id);
              const blocked  = gate && score < gate.repThreshold;
              const canAfford = (coins ?? 0) >= price;
              const tierEntry = (rep.tiers || []).slice().reverse().find((t) => score >= t.threshold)
                || (rep.tiers || [])[0];
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3 bg-[#12121f] border border-[#2a2a3e] rounded-lg px-3 py-2.5"
                >
                  <div className="text-2xl leading-none mt-0.5">{c.emoji || "🏙️"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                      {c.country && (
                        <span className="text-[10px] text-gray-500">{c.country}</span>
                      )}
                      {c.nbCharacters > 0 && (
                        <span className="text-[10px] text-emerald-400">
                          · {c.nbCharacters} here now
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Your reputation:{" "}
                      <span className="text-amber-200">
                        {tierEntry?.emoji || "·"} {score}
                      </span>
                      {gate && (
                        <span className={blocked ? "text-rose-400" : "text-emerald-400"}>
                          {" · "}gate: {gate.repThreshold}
                          {gate.label ? ` (${gate.label})` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!canAfford || blocked || busyId === c.id}
                    onClick={() => handleBuy(c.id)}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      !canAfford || blocked
                        ? "bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed"
                        : "bg-sky-500/25 border-sky-400/50 text-sky-100 hover:bg-sky-500/40"
                    }`}
                    title={
                      blocked
                        ? `Earn ${gate.repThreshold - score} more rep first`
                        : !canAfford
                        ? "Not enough coins"
                        : `Travel for ${price} coins`
                    }
                  >
                    {busyId === c.id ? "…" : `🪙 ${price}`}
                  </button>
                </div>
              );
            })}
          </div>

          {msg && (
            <div className={`px-5 py-2 text-sm ${msg.type === "ok" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {msg.text}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TravelPanel;
