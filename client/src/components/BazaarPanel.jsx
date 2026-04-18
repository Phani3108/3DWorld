import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBazaar, buyBazaarItem, fetchBarter, tradeBundle } from "../lib/api";
import { cityAtom, coinsAtom } from "./SocketManager";

/** Phase 7G — BazaarPanel: coins-only marketplace overlay. */
export const bazaarOpenAtom = atom(false);

export const BazaarPanel = () => {
  const [open, setOpen] = useAtom(bazaarOpenAtom);
  const [city] = useAtom(cityAtom);
  const [coins, setCoins] = useAtom(coinsAtom);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState(null);
  // Phase 7I — barter bundles tab
  const [tab, setTab] = useState("items");
  const [bundles, setBundles] = useState([]);
  const [bundlesLoaded, setBundlesLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchBazaar(city || undefined)
      .then((list) => { if (!cancelled) { setItems(Array.isArray(list) ? list : []); setLoaded(true); } })
      .catch(() => { if (!cancelled) setLoaded(true); });
    fetchBarter(city || undefined)
      .then((list) => { if (!cancelled) { setBundles(Array.isArray(list) ? list : []); setBundlesLoaded(true); } })
      .catch(() => { if (!cancelled) setBundlesLoaded(true); });
    return () => { cancelled = true; };
  }, [open, city]);

  const handleTrade = async (bundleId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setMsg({ type: "error", text: "Please reload." }); return; }
    try {
      const res = await tradeBundle(userId, bundleId);
      setCoins(res.coins);
      setMsg({ type: "ok", text: `Traded for ${res.bundle.name}. +${res.refundBonus} 🪙 bonus!` });
      setTimeout(() => setMsg(null), 3200);
    } catch (e) {
      const raw = e.message || "Trade failed";
      if (raw.includes("missing_knowledge")) {
        setMsg({ type: "error", text: "Learn about this topic first — ask a host about it." });
      } else {
        setMsg({ type: "error", text: raw });
      }
      setTimeout(() => setMsg(null), 4200);
    }
  };

  const handleBuy = async (itemId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setMsg({ type: "error", text: "Please reload and set a name." }); return; }
    try {
      const res = await buyBazaarItem(userId, itemId);
      setCoins(res.coins);
      setMsg({ type: "ok", text: `Bought ${res.item.name}. Check 🎒 for your souvenirs.` });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Purchase failed" });
      setTimeout(() => setMsg(null), 3500);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="bazaar"
        className="fixed inset-0 z-[150] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full sm:w-[560px] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-[#1a1a2e] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-amber-400/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1a2e] border-b border-[#2a2a3e]">
            <div>
              <h2 className="text-lg font-bold text-white">🛍️ Bazaar{city ? ` · ${city}` : ""}</h2>
              <div className="text-[11px] text-gray-400">Coins-only. Keeps you thinking local.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-300 font-semibold">🪙 {coins ?? 0}</span>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a3e]">
            <button
              className={`flex-1 py-2 transition-colors ${tab === "items" ? "bg-amber-500/20 text-amber-200" : "text-gray-500 hover:text-gray-300"}`}
              onClick={() => setTab("items")}
            >
              🛍️ Items
            </button>
            <button
              className={`flex-1 py-2 transition-colors ${tab === "bundles" ? "bg-cyan-500/20 text-cyan-200" : "text-gray-500 hover:text-gray-300"}`}
              onClick={() => setTab("bundles")}
            >
              🎁 Bundles
            </button>
          </div>

          <div className="px-5 py-4 space-y-2">
            {tab === "items" && (
              !loaded ? (
                <div className="text-center text-gray-500 text-sm py-8">Loading bazaar…</div>
              ) : items.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No items in this city yet.
                </div>
              ) : (
                items.map((it) => {
                  const canAfford = (coins ?? 0) >= it.price;
                  return (
                    <div
                      key={it.id}
                      className="flex items-start gap-3 bg-[#12121f] border border-[#2a2a3e] rounded-lg px-3 py-2.5"
                    >
                      <div className="text-2xl leading-none mt-0.5">{it.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">{it.name}</div>
                        <div className="text-[11px] text-gray-500">
                          Sold by <span className="text-sky-400">{it.sellerId}</span>
                          {" · "}
                          <span className="text-gray-400">{it.venueId}</span>
                        </div>
                        <div className="text-[12px] text-gray-300 mt-1 leading-snug">{it.blurb}</div>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={() => handleBuy(it.id)}
                        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          canAfford
                            ? "bg-amber-500/25 border-amber-400/50 text-amber-100 hover:bg-amber-500/40"
                            : "bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed"
                        }`}
                        title={canAfford ? "Buy" : "Not enough coins"}
                      >
                        🪙 {it.price}
                      </button>
                    </div>
                  );
                })
              )
            )}
            {tab === "bundles" && (
              !bundlesLoaded ? (
                <div className="text-center text-gray-500 text-sm py-8">Loading bundles…</div>
              ) : bundles.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No bundles available in this city yet.
                </div>
              ) : (
                bundles.map((b) => {
                  const canAfford = (coins ?? 0) >= b.priceCoins;
                  return (
                    <div
                      key={b.id}
                      className="bg-[#12121f] border border-cyan-400/25 rounded-lg px-3 py-2.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl leading-none mt-0.5">{b.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white">{b.name}</div>
                          <div className="text-[11px] text-gray-500">
                            Traded by <span className="text-sky-400">{b.sellerId}</span>
                            {" · "}
                            <span className="text-cyan-300">requires: {b.requiresTag}</span>
                          </div>
                          <div className="text-[12px] text-gray-300 mt-1 leading-snug">{b.blurb}</div>
                          {Array.isArray(b.gives?.items) && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {b.gives.items.map((gi, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full"
                                >
                                  {gi.emoji} {gi.label}
                                </span>
                              ))}
                              {b.gives.coinBonus ? (
                                <span className="text-[11px] bg-amber-500/15 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                  +{b.gives.coinBonus} 🪙
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                        <button
                          disabled={!canAfford}
                          onClick={() => handleTrade(b.id)}
                          className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                            canAfford
                              ? "bg-cyan-500/25 border-cyan-400/50 text-cyan-100 hover:bg-cyan-500/40"
                              : "bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed"
                          }`}
                          title={canAfford ? "Trade" : "Not enough coins"}
                        >
                          🪙 {b.priceCoins}
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            )}
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

export default BazaarPanel;
