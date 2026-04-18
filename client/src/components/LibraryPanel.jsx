import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProfile, fetchUserConversations } from "../lib/api";

/**
 * LibraryPanel — Phase 7J.
 *
 * Your personal library of things you've learned, with citations pulled
 * from two sources:
 *   1. profile.learnedFacts  — the snapshot saved at Ask time.
 *   2. /users/:id/conversations — the tagged archive entries.
 *
 * Each row shows the answer + who taught you + where + tags. Good demo
 * surface for "show me what the world has taught me".
 */
export const libraryOpenAtom = atom(false);

export const LibraryPanel = () => {
  const [open, setOpen] = useAtom(libraryOpenAtom);
  const [facts, setFacts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const userId = localStorage.getItem("3dworld_user_id");
    if (!userId) { setLoaded(true); return; }
    Promise.all([
      fetchProfile(userId).catch(() => null),
      fetchUserConversations(userId, 40).catch(() => []),
    ]).then(([profile, convos]) => {
      if (cancelled) return;
      setFacts(Array.isArray(profile?.learnedFacts) ? profile.learnedFacts : []);
      setThreads(Array.isArray(convos) ? convos : []);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [open]);

  // Merge by question text (archive is richer; facts is the fallback)
  const byQuestion = new Map();
  for (const t of threads) {
    byQuestion.set(String(t.question).toLowerCase().trim(), {
      source: "archive",
      question: t.question,
      answer: t.answer,
      teacher: t.toBotName,
      venue: t.venueName,
      cityId: t.cityId,
      at: t.at,
      tags: t.tags || [],
    });
  }
  for (const f of facts) {
    const key = String(f.question || "").toLowerCase().trim();
    if (byQuestion.has(key)) continue;
    byQuestion.set(key, {
      source: "fact",
      question: f.question,
      answer: f.answer,
      teacher: f.fromBotName,
      venue: f.fromVenueName,
      cityId: f.cityId,
      at: f.learnedAt,
      tags: [],
    });
  }
  const merged = [...byQuestion.values()].sort((a, b) => (b.at || 0) - (a.at || 0));

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="library"
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
          className="relative w-[620px] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-[#1a1a2e] rounded-2xl shadow-2xl border border-sky-400/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1a2e] border-b border-[#2a2a3e]">
            <div>
              <h2 className="text-lg font-bold text-white">📚 Your Library</h2>
              <div className="text-[11px] text-gray-400">
                Everything you've learned — with citations.
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {!loaded ? (
              <div className="text-center text-gray-500 text-sm py-8">Loading library…</div>
            ) : merged.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-10">
                No entries yet. Ask a host about their specialty to start filling your library.
              </div>
            ) : (
              merged.map((e, idx) => (
                <div
                  key={idx}
                  className="bg-[#12121f] border border-[#2a2a3e] rounded-lg px-3 py-2.5"
                >
                  <div className="text-sm font-semibold text-white">
                    {e.question}
                  </div>
                  <div className="text-[13px] text-gray-300 leading-snug mt-1">
                    {e.answer}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
                    <span>
                      — <span className="text-sky-400">{e.teacher || "someone"}</span>
                    </span>
                    {e.venue && <span>· {e.venue}</span>}
                    {e.cityId && <span>· {e.cityId}</span>}
                    {e.at && <span>· {new Date(e.at).toLocaleDateString()}</span>}
                    <span className={`ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      e.source === "archive" ? "bg-cyan-900/40 text-cyan-300" : "bg-amber-900/40 text-amber-300"
                    }`}>
                      {e.source === "archive" ? "🧠 archive" : "📝 note"}
                    </span>
                  </div>
                  {Array.isArray(e.tags) && e.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.tags.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-1.5 py-[1px] rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LibraryPanel;
