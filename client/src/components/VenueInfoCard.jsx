import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import {
  currentVenueAtom,
  currentHotspotAtom,
  coinsAtom,
  inventoryAtom,
  roomIDAtom,
  usernameAtom,
  languageAtom,
  llmStatusAtom,
} from "./SocketManager";
import { buyFood, askAgent, fetchUserQuests, acceptQuest, fetchEventsAtVenue } from "../lib/api";

/**
 * VenueInfoCard — auto-slides in from the bottom-right on `venueEnter`.
 * Shows the venue's name, blurb, fun facts, 2–3 menu items (1-tap buy),
 * and the conversation seed chips (1-tap ask).
 */
export const VenueInfoCard = () => {
  const [venue] = useAtom(currentVenueAtom);
  const [hotspotState] = useAtom(currentHotspotAtom);
  const [language] = useAtom(languageAtom);
  const [llmStatus] = useAtom(llmStatusAtom);
  const [coins, setCoins] = useAtom(coinsAtom);
  const [inventory, setInventory] = useAtom(inventoryAtom);
  const [roomID] = useAtom(roomIDAtom);
  const [username] = useAtom(usernameAtom);

  const [hidden, setHidden] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  const [buyMsg, setBuyMsg] = useState(null);
  const [askMsg, setAskMsg] = useState(null);

  // Phase 9B discovery — quests offered by this venue's host that the
  // local user hasn't accepted/completed yet. Re-checked on venue change.
  const [hostQuests, setHostQuests] = useState([]);
  const [questBusy, setQuestBusy] = useState(false);
  useEffect(() => {
    if (!venue) { setHostQuests([]); return; }
    let cancelled = false;
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) return;
    fetchUserQuests(userId)
      .then((data) => {
        if (cancelled || !data) return;
        const offered = (data.offers || [])
          .filter((q) => {
            // venue.host points to a host's resident id; filter offers
            // from any resident whose homeVenueId matches this venue.
            // Since the offer record carries giverId, fall back to that.
            return q.giverId === venue.host;
          });
        setHostQuests(offered);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [venue?.id]);

  // Phase 9G — live event lookup for the current venue.
  const [liveEvent, setLiveEvent] = useState(null);
  useEffect(() => {
    if (!venue) { setLiveEvent(null); return; }
    let cancelled = false;
    fetchEventsAtVenue(venue.id)
      .then((data) => { if (!cancelled) setLiveEvent(data?.liveNow || null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [venue?.id]);

  const handleAcceptQuest = async (questId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) return;
    setQuestBusy(true);
    try {
      await acceptQuest(userId, questId);
      setAskMsg({ type: "ok", text: "Quest accepted — progress will tick as you play." });
      setHostQuests((prev) => prev.filter((q) => q.id !== questId));
    } catch (e) {
      setAskMsg({ type: "error", text: e.message || "Couldn't accept quest." });
    } finally {
      setQuestBusy(false);
      setTimeout(() => setAskMsg(null), 3000);
    }
  };

  // If no venue, or user hid the card, render nothing (state clears on venueExit)
  if (!venue || hidden) return null;

  const accentHex = "#f59e0b";
  const menu = Array.isArray(venue.menu) ? venue.menu : [];
  const seeds = venue.conversation?.suggestedSeeds || [];
  const funFacts = venue.information?.funFacts || [];

  // Phase 7E.1 — hotspot affordance. Only considered if the backend says
  // we're inside *this* venue (defensive against stale state).
  const hotspot =
    hotspotState && hotspotState.venueId === venue.id ? hotspotState.hotspot : null;
  const hotspotActionLabel = (() => {
    if (!hotspot) return null;
    switch (hotspot.kind) {
      case "order":           return menu.length > 0 ? `+ ${menu[0]}`  : "Order";
      case "lean_on_counter": return "Chat with the host";
      case "sit_and_chat":    return seeds.length > 0 ? "Ask the host" : "Sit & chat";
      case "pose_together":   return "📸 Take a photo";
      case "listen":          return "👂 Listen in";
      default:                return null;
    }
  })();
  const handleHotspotAction = () => {
    if (!hotspot) return;
    switch (hotspot.kind) {
      case "order":
        if (menu.length > 0) handleBuy(menu[0]);
        return;
      case "lean_on_counter":
      case "sit_and_chat":
        if (seeds.length > 0) handleAskSeed(seeds[0]);
        return;
      case "pose_together": {
        // Dispatch a global event — ScreenshotButton (Phase 6) listens for
        // this so we don't have to couple the two components tightly.
        const ev = new CustomEvent("3dworld:takeScreenshot", {
          detail: { source: "hotspot", venueId: venue.id, hotspotId: hotspot.id },
        });
        window.dispatchEvent(ev);
        return;
      }
      case "listen":
        // 7E.5 will hook this into the ambient-dialogue subscription. For now
        // surface an acknowledgement so the button feels alive.
        setAskMsg({ type: "info", text: "Listening for ambient chatter…" });
        setTimeout(() => setAskMsg(null), 2800);
        return;
      default:
        return;
    }
  };

  const handleBuy = async (foodId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    try {
      const res = await buyFood(userId, foodId);
      setCoins(res.coins);
      setInventory((prev) => ({ ...prev, food: [...(prev?.food || []), res.token] }));
      setBuyMsg({ type: "ok", text: `Bought ${res.food.name}. Open 🍽️ Food → Bag to eat.` });
      setTimeout(() => setBuyMsg(null), 3000);
    } catch (e) {
      setBuyMsg({ type: "error", text: e.message || "Buy failed" });
      setTimeout(() => setBuyMsg(null), 3500);
    }
  };

  const handleAskSeed = async (seed) => {
    const userId = localStorage.getItem("3dworld_user_id");
    try {
      const res = await askAgent(userId, username, venue.host || venue.id, seed, roomID, venue.id);
      // If the server returned a canned answer immediately, it's already been
      // broadcast as an in-world chat bubble and recorded as a 🧠 learned fact.
      // Otherwise the question is queued for a real bot.
      if (res.answer) {
        setAskMsg({ type: "ok", text: "Host answered in chat — also saved as a 🧠 learned fact." });
      } else if (res.channel === "polling") {
        setAskMsg({ type: "info", text: "Question queued — any agent logged in as host will answer." });
      } else {
        setAskMsg({ type: "ok", text: "Sent. Watch the in-world chat." });
      }
      setTimeout(() => setAskMsg(null), 4000);
    } catch (e) {
      setAskMsg({ type: "error", text: e.message });
      setTimeout(() => setAskMsg(null), 3500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={venue.id}
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-24 right-4 z-[115] w-96 max-w-[calc(100vw-2rem)] bg-[#1a1a2e] rounded-2xl shadow-2xl border overflow-hidden pointer-events-auto"
        style={{ borderColor: `${accentHex}40` }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-start justify-between"
          style={{ background: `linear-gradient(135deg, ${accentHex}33, transparent)` }}
        >
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-2xl leading-none mt-0.5">{venue.emoji}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">{venue.name}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">{venue.blurb}</p>
              <div className="flex gap-1 mt-1 text-[9px] uppercase tracking-wider flex-wrap">
                <span className="text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">{venue.type}</span>
                {venue.ambience?.music && (
                  <span className="text-pink-300 bg-pink-500/20 px-1.5 py-0.5 rounded">🎵 ambience</span>
                )}
                {/* Phase 9G — LIVE NOW chip. When a scheduled event is
                    currently running at this venue, light it up so players
                    feel "I should be here right now". */}
                {liveEvent && (
                  <span
                    className="text-emerald-200 bg-emerald-500/30 px-1.5 py-0.5 rounded font-bold animate-pulse"
                    title={liveEvent.blurb}
                  >
                    {liveEvent.emoji || "🟢"} LIVE · {liveEvent.title}
                  </span>
                )}
                {/* Phase 8E — LLM status chip. Shows ⚡ Live when a real
                    provider is configured, 🤖 Stub when running without
                    an API key (still demonstrable). */}
                {llmStatus?.active && (
                  <span
                    className={
                      llmStatus.active.stub
                        ? "text-gray-300 bg-slate-500/25 px-1.5 py-0.5 rounded"
                        : "text-cyan-200 bg-cyan-500/25 px-1.5 py-0.5 rounded"
                    }
                    title={`${llmStatus.active.id} · ${llmStatus.active.model}`}
                  >
                    {llmStatus.active.stub ? "🤖 stub" : `⚡ ${llmStatus.active.id}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setHidden(true)}
            className="shrink-0 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 text-xs leading-none"
            aria-label="Hide (re-enter venue to reopen)"
          >
            ×
          </button>
        </div>

        {/* Greeting */}
        {venue.conversation?.defaultGreeting && (
          <div className="px-4 py-2 bg-slate-900/50 border-y border-slate-800">
            <p className="text-xs text-gray-300 italic leading-snug">
              <span className="text-amber-400">💬 </span>
              "{venue.conversation.defaultGreeting}"
            </p>
          </div>
        )}

        {/* Phase 9B — Host quest chip. Solves the #1 onboarding gap by
            making "Farah has a quest for you" visible the moment you walk
            into Paradise, without requiring the player to discover the
            QuestsPanel. Tapping accepts the quest in-place. */}
        {hostQuests.length > 0 && (
          <div className="px-4 py-2 bg-emerald-500/10 border-y border-emerald-400/30">
            {hostQuests.slice(0, 1).map((q) => (
              <div key={q.id} className="flex items-center gap-2">
                <span className="text-base leading-none">🎯</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] uppercase tracking-wider text-emerald-300/80">
                    Quest from the host
                  </div>
                  <div className="text-xs font-semibold text-emerald-100 truncate">
                    {q.title}
                  </div>
                  <div className="text-[10px] text-emerald-200/70 truncate">
                    +{q.reward?.coins || 0} 🪙 · +{q.reward?.xp || 0} XP · +{q.reward?.reputation || 0} rep
                  </div>
                </div>
                <button
                  disabled={questBusy}
                  onClick={() => handleAcceptQuest(q.id)}
                  className="shrink-0 text-[11px] bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-400/50 font-semibold transition-colors disabled:opacity-50"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Phase 7E.1 — Hotspot chip + affordance button */}
        {hotspot && (
          <div className="px-4 py-2 bg-amber-500/10 border-y border-amber-400/25 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-amber-400/80">
                📍 You're at
              </div>
              <div className="text-xs font-semibold text-amber-100 truncate">
                {hotspot.label}
              </div>
            </div>
            {hotspotActionLabel && (
              <button
                onClick={handleHotspotAction}
                className="shrink-0 text-[11px] bg-amber-500/30 hover:bg-amber-500/45 text-amber-50 px-3 py-1.5 rounded-lg border border-amber-400/40 font-semibold transition-colors"
              >
                {hotspotActionLabel}
              </button>
            )}
          </div>
        )}

        {/* Menu */}
        {menu.length > 0 && (
          <div className="px-4 pt-3 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Local menu</div>
            <div className="flex flex-wrap gap-1.5">
              {menu.map((foodId) => (
                <button
                  key={foodId}
                  onClick={() => handleBuy(foodId)}
                  className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors"
                >
                  + {foodId}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Seeds */}
        {seeds.length > 0 && (
          <div className="px-4 pt-2 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              🧠 Ask the host
            </div>
            <div className="flex flex-col gap-1.5">
              {seeds.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAskSeed(s)}
                  className="text-[11px] text-left bg-slate-800 hover:bg-slate-700 text-gray-200 px-2.5 py-1.5 rounded-lg border border-slate-700 leading-snug transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fun facts (collapsible) */}
        {funFacts.length > 0 && (
          <div className="px-4 pt-1 pb-3">
            <button
              onClick={() => setFactsOpen((v) => !v)}
              className="text-[11px] text-sky-400 hover:text-sky-300"
            >
              {factsOpen ? "▾" : "▸"} Fun facts ({funFacts.length})
            </button>
            {factsOpen && (
              <ul className="mt-1.5 space-y-1 text-[11px] text-gray-400 list-disc pl-4">
                {funFacts.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Toasts */}
        {buyMsg && (
          <div className={`px-4 py-2 text-[11px] font-medium ${buyMsg.type === "ok" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
            {buyMsg.text}
          </div>
        )}
        {askMsg && (
          <div className={`px-4 py-2 text-[11px] font-medium ${askMsg.type === "ok" ? "bg-emerald-500/20 text-emerald-300" : askMsg.type === "error" ? "bg-rose-500/20 text-rose-300" : "bg-sky-500/20 text-sky-300"}`}>
            {askMsg.text}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VenueInfoCard;
