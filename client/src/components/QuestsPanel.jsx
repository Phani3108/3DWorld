import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUserQuests, acceptQuest } from "../lib/api";

/**
 * QuestsPanel — Phase 9B.
 *
 * Overlay showing three stacks: Active, Offers, Completed.
 * Acceptance calls /api/v1/quests/accept, then re-fetches so progress
 * can advance as the user plays.
 */
export const questsOpenAtom = atom(false);

export const QuestsPanel = () => {
  const [open, setOpen] = useAtom(questsOpenAtom);
  const [state, setState] = useState({ active: [], offers: [], completed: [] });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState(null);

  const refresh = async () => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setLoaded(true); return; }
    try {
      const data = await fetchUserQuests(userId);
      setState(data || { active: [], offers: [], completed: [] });
    } catch {}
    setLoaded(true);
  };

  useEffect(() => { if (open) refresh(); }, [open]);

  const onAccept = async (questId) => {
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) return;
    try {
      await acceptQuest(userId, questId);
      setMsg({ type: "ok", text: "Quest accepted — progress will tick as you play." });
      setTimeout(() => setMsg(null), 3000);
      refresh();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Couldn't accept." });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="quests"
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
          className="relative w-full sm:w-[620px] max-w-[calc(100vw-2rem)] max-h-[82vh] overflow-y-auto bg-[#1a1a2e] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-emerald-400/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1a2e] border-b border-[#2a2a3e]">
            <div>
              <h2 className="text-lg font-bold text-white">🎯 Quests</h2>
              <div className="text-[11px] text-gray-400">
                {state.active.length} active · {state.offers.length} on offer · {state.completed.length} done
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
              aria-label="Close"
            >×</button>
          </div>

          <div className="px-5 py-4 space-y-5">
            {!loaded && (
              <div className="text-center text-gray-500 text-sm py-8">Loading quests…</div>
            )}

            {loaded && state.active.length > 0 && (
              <Section title="⚡ Active" color="#10b981">
                {state.active.map((q) => <QuestRow key={q.id} q={q} />)}
              </Section>
            )}
            {loaded && state.offers.length > 0 && (
              <Section title="📜 On offer" color="#38bdf8">
                {state.offers.map((q) => (
                  <QuestRow key={q.id} q={q} onAccept={() => onAccept(q.id)} />
                ))}
              </Section>
            )}
            {loaded && state.completed.length > 0 && (
              <Section title="✅ Completed" color="#f59e0b">
                {state.completed.map((q) => <QuestRow key={q.id} q={q} />)}
              </Section>
            )}
            {loaded && state.active.length + state.offers.length + state.completed.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                No quests yet. Hosts in each city offer one — go ask around.
              </div>
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

const Section = ({ title, color, children }) => (
  <div>
    <div
      className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
      style={{ color }}
    >
      {title}
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const QuestRow = ({ q, onAccept }) => {
  const needed = q.goal?.count || 1;
  const progress = q.progress || 0;
  const pct = Math.min(100, 100 * progress / needed);
  const stateColor =
    q.state === "completed" ? "#f59e0b" :
    q.state === "active"    ? "#10b981" : "#38bdf8";
  return (
    <div className="bg-[#12121f] border border-[#2a2a3e] rounded-lg px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">{q.title}</div>
          <div className="text-[12px] text-gray-400 mt-0.5 leading-snug">{q.blurb}</div>
          <div className="text-[10px] text-gray-500 mt-1">
            Given by <span className="text-sky-400">{q.giverId}</span>
            {" · goal: "}
            <span className="text-gray-300 font-mono">{q.goal?.type} / {q.goal?.target}</span>
          </div>
          {q.state === "active" && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>progress</span>
                <span>{progress} / {needed}</span>
              </div>
              <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stateColor }} />
              </div>
            </div>
          )}
          {q.state === "completed" && q.reward && (
            <div className="mt-1 text-[11px] text-amber-300">
              Rewarded: +{q.reward.coins || 0} 🪙 · +{q.reward.xp || 0} XP · +{q.reward.reputation || 0} rep
            </div>
          )}
        </div>
        {onAccept && (
          <button
            onClick={onAccept}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/40"
          >
            Accept
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestsPanel;
