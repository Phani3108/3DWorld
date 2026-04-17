import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import {
  cityAtom,
  inventoryAtom,
  foodPanelOpenAtom,
  socket,
  coinsAtom,
  motivesAtom,
} from "./SocketManager";
import { fetchFoods, buyFood } from "../lib/api";

/**
 * FoodPanel — side panel listing the current city's menu + the player's
 * inventory. Click "Buy" to call POST /api/v1/food/buy, click "Eat" to
 * emit the socket event which triggers the eating bubble + motive deltas.
 */
export const FoodPanel = () => {
  const [open, setOpen] = useAtom(foodPanelOpenAtom);
  const [currentCity] = useAtom(cityAtom);
  const [inventory, setInventory] = useAtom(inventoryAtom);
  const [coins, setCoins] = useAtom(coinsAtom);
  const [motives] = useAtom(motivesAtom);
  const [allFoods, setAllFoods] = useState(null);
  const [tab, setTab] = useState("menu"); // "menu" | "bag"
  const [buyError, setBuyError] = useState(null);
  const [buying, setBuying] = useState(null); // foodId in flight

  useEffect(() => {
    if (!open) return;
    if (!allFoods) fetchFoods().then(setAllFoods).catch(() => {});
  }, [open]);

  const cityMenu = useMemo(() => {
    if (!allFoods) return [];
    if (!currentCity?.id) return allFoods; // Plaza fallback: show everything
    return allFoods.filter((f) => f.city === currentCity.id);
  }, [allFoods, currentCity?.id]);

  // Group inventory tokens by foodId so the bag shows counts.
  const bag = useMemo(() => {
    const map = new Map();
    for (const token of inventory?.food || []) {
      const entry = map.get(token.foodId) || { foodId: token.foodId, count: 0, tokens: [] };
      entry.count += 1;
      entry.tokens.push(token);
      map.set(token.foodId, entry);
    }
    const foodById = new Map((allFoods || []).map((f) => [f.id, f]));
    return [...map.values()].map((e) => ({ ...e, food: foodById.get(e.foodId) || null }));
  }, [inventory, allFoods]);

  const handleBuy = async (food) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setBuyError("Sign in first."); return; }
    if (coins < food.price) { setBuyError(`Need ${food.price} coins, you have ${coins}.`); return; }
    setBuyError(null);
    setBuying(food.id);
    try {
      const res = await buyFood(userId, food.id);
      setCoins(res.coins);
      setInventory((prev) => ({
        ...prev,
        food: [...(prev?.food || []), res.token],
      }));
    } catch (e) {
      setBuyError(e.message);
    } finally {
      setBuying(null);
    }
  };

  const handleEat = (foodId) => {
    socket.emit("eat", foodId);
    // Optimistically remove one matching token; the server's `eatError` event
    // would re-sync, but the happy path is the norm.
    setInventory((prev) => {
      const list = [...(prev?.food || [])];
      const idx = list.findIndex((t) => t.foodId === foodId);
      if (idx >= 0) list.splice(idx, 1);
      return { ...prev, food: list };
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[115] flex items-end sm:items-center justify-end pointer-events-none">
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="pointer-events-auto bg-[#1a1a2e] border border-amber-400/30 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-96 sm:mr-6 max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-amber-400/15">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍽️</span> Food
              </h2>
              <p className="text-xs text-gray-400">
                {currentCity
                  ? <>Local menu in <span className="text-amber-300">{currentCity.emoji} {currentCity.id}</span></>
                  : "Tavern menu"}
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

          {/* Stats row */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-amber-400/10 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
            <div className="flex gap-3 text-[10px]">
              <MotiveChip label="Energy" value={motives?.energy ?? 100} color="#38bdf8" />
              <MotiveChip label="Hunger" value={motives?.hunger ?? 100} color="#fb923c" />
              <MotiveChip label="Fun"    value={motives?.fun ?? 100}    color="#fb7185" />
              <MotiveChip label="Social" value={motives?.social ?? 100} color="#10b981" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-amber-400/10 text-xs font-semibold">
            <button
              className={`flex-1 py-2 ${tab === "menu" ? "bg-amber-500/20 text-amber-300" : "text-gray-400 hover:bg-amber-400/10"}`}
              onClick={() => setTab("menu")}
            >
              Menu
            </button>
            <button
              className={`flex-1 py-2 ${tab === "bag" ? "bg-amber-500/20 text-amber-300" : "text-gray-400 hover:bg-amber-400/10"}`}
              onClick={() => setTab("bag")}
            >
              Bag ({(inventory?.food || []).length})
            </button>
          </div>

          {buyError && (
            <div className="bg-rose-500/20 text-rose-300 text-xs px-5 py-2 border-b border-rose-500/30">
              {buyError}
            </div>
          )}

          {/* Menu tab */}
          {tab === "menu" && (
            <div className="overflow-y-auto p-3 space-y-2">
              {!allFoods && <div className="text-xs text-gray-500 text-center py-6">Loading menu…</div>}
              {allFoods && cityMenu.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-6">No local menu yet.</div>
              )}
              {cityMenu.map((food) => (
                <div key={food.id} className="bg-slate-900 rounded-xl p-3 flex items-center gap-3 border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {food.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{food.name}</div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">{food.description}</div>
                    <div className="flex gap-2 mt-0.5 text-[10px] text-gray-400">
                      {Object.entries(food.satisfies || {}).map(([k, v]) => (
                        <span key={k}>+{v} {k}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(food)}
                    disabled={buying === food.id || coins < food.price}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      coins < food.price
                        ? "bg-slate-700 text-gray-500 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-900"
                    }`}
                  >
                    {buying === food.id ? "…" : `🪙 ${food.price}`}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bag tab */}
          {tab === "bag" && (
            <div className="overflow-y-auto p-3 space-y-2">
              {bag.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-6">
                  Your bag is empty. Buy something from the menu tab.
                </div>
              )}
              {bag.map((entry) => (
                <div key={entry.foodId} className="bg-slate-900 rounded-xl p-3 flex items-center gap-3 border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {entry.food?.emoji || "🍱"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                      {entry.food?.name || entry.foodId}
                      <span className="text-[10px] bg-slate-700 rounded-full px-1.5 py-0.5 text-gray-300">×{entry.count}</span>
                    </div>
                    {entry.food && (
                      <div className="flex gap-2 mt-0.5 text-[10px] text-gray-500">
                        {Object.entries(entry.food.satisfies || {}).map(([k, v]) => (
                          <span key={k}>+{v} {k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleEat(entry.foodId)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors"
                  >
                    Eat
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const MotiveChip = ({ label, value, color }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-gray-400">{label}</span>
      <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default FoodPanel;
