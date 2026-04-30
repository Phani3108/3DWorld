import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchDailyDigest,
  fetchCityLeaderboard,
} from "../lib/api";
import { cityAtom } from "./SocketManager";
import soundManager from "../audio/SoundManager";

/**
 * CityInfoCard — Phase 11D / closes Phase 10J.
 *
 * One panel that surfaces every per-city metric the server already
 * exposes but never made it to a UI:
 *   • Top-5 reputation leaderboard   (/api/v1/cities/:id/leaderboard)
 *   • 24h digest highlights          (/api/v1/digest?city=:id)
 *   • Currently-playing music track  (soundManager.currentTrack)
 *   • City tagline + ambient feel    (cityAtom)
 *
 * Opens via the 📊 toolbar chip OR pressing `i`. Auto-loads its data
 * on open; closes on outside click + Esc.
 */
export const cityInfoOpenAtom = atom(false);

export const CityInfoCard = () => {
  const [open, setOpen] = useAtom(cityInfoOpenAtom);
  const [city] = useAtom(cityAtom);
  const [leaderboard, setLeaderboard] = useState([]);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [musicTrack, setMusicTrack] = useState(null);

  // Lazy-load on open / city change
  useEffect(() => {
    if (!open) return;
    if (!city?.id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchCityLeaderboard(city.id).catch(() => []),
      fetchDailyDigest(city.id).catch(() => null),
    ]).then(([lb, dg]) => {
      if (cancelled) return;
      setLeaderboard(Array.isArray(lb) ? lb : []);
      setDigest(dg);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, city?.id]);

  // Poll the soundManager every 1.5 s while open so the music section
  // stays current when the player crosses into a venue.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      const t = soundManager.currentTrack || null;
      setMusicTrack((prev) => (prev?.key === t?.key ? prev : t));
    }, 1500);
    return () => clearInterval(id);
  }, [open]);

  // 'i' key + Esc shortcuts — only when input/textarea isn't focused.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!open) return null;
  if (!city?.id) {
    // Tiny fallback chip when there's no current city resolved.
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center" onClick={() => setOpen(false)}>
        <div className="bg-[#1a1a2e] border border-amber-400/30 rounded-2xl px-6 py-4 text-amber-200 text-sm">
          Pick a city first to see its stats.
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="city-info"
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
          className="relative w-full sm:w-[640px] max-w-[calc(100vw-2rem)] max-h-[82vh] overflow-y-auto bg-[#1a1a2e] rounded-2xl shadow-2xl border border-amber-400/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-3 flex items-start justify-between gap-3 border-b border-[#2a2a3e]"
            style={{
              background: `linear-gradient(135deg, ${city?.palette?.accent || "#fbbf24"}33, transparent)`,
            }}
          >
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">
                {city.emoji || "🏙️"} {city.name}
              </h2>
              <div className="text-[11px] text-gray-400 truncate">
                {city.tagline || `${city.country} · live now`}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
              aria-label="Close"
            >×</button>
          </div>

          {/* Currently playing music */}
          {musicTrack?.title && (
            <div className="px-5 py-2 bg-pink-500/10 border-b border-pink-400/20 text-[12px] text-pink-200 flex items-center gap-2">
              <span>🔊</span>
              <span className="font-semibold">Now playing:</span>
              <span className="truncate">{musicTrack.title}</span>
              {musicTrack.license && (
                <span className="ml-auto text-[10px] opacity-70">{musicTrack.license}</span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Leaderboard */}
            <Section title="🏅 Top 5 reputations">
              {loading && leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">Loading…</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No reputation in this city yet — be the first.
                </div>
              ) : (
                <div className="space-y-1">
                  {leaderboard.slice(0, 5).map((row, i) => (
                    <div
                      key={row.userId || i}
                      className="flex items-center gap-2 text-[12px] text-gray-200 px-2 py-1 rounded bg-[#12121f]"
                    >
                      <span className="w-5 text-amber-400 font-bold">#{i + 1}</span>
                      <span className="flex-1 truncate font-mono">{row.userId}</span>
                      <span className="text-amber-300 text-[11px]">{row.score} rep</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Digest tags + teachers */}
            {digest && (
              <Section title="🧠 Today's knowledge">
                {Array.isArray(digest.topTags) && digest.topTags.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {digest.topTags.slice(0, 8).map((t) => (
                        <span
                          key={t.tag}
                          className="text-[10px] bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full"
                        >
                          {t.tag} <span className="opacity-60">·{t.count}</span>
                        </span>
                      ))}
                    </div>
                    {Array.isArray(digest.topTeachers) && digest.topTeachers.length > 0 && (
                      <div className="text-[11px] text-gray-400">
                        Most active teachers:{" "}
                        {digest.topTeachers.slice(0, 4).map((t) => (
                          <span key={t.name} className="text-sky-400 mr-1.5">
                            {t.name} ·{t.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[12px] text-gray-500">
                    No archived conversations in the last 24 h yet.
                  </div>
                )}
              </Section>
            )}

            {/* Recent activity */}
            {digest?.recent?.length > 0 && (
              <Section title="📰 Recent activity">
                <div className="space-y-1.5">
                  {digest.recent.slice(0, 6).map((e) => (
                    <div key={e.id} className="text-[11px] text-gray-300 leading-snug">
                      <span className="text-amber-300 mr-1">{e.emoji || "·"}</span>
                      <span className="text-gray-400">{e.actorName || "someone"}</span>{" "}
                      <span className="text-gray-500">{e.text}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Footer hint */}
            <div className="text-[10px] text-gray-500 text-center pt-2 border-t border-[#2a2a3e]">
              Press <span className="text-amber-300">i</span> to toggle · <span className="text-amber-300">Esc</span> to close
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Section = ({ title, children }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
      {title}
    </div>
    {children}
  </div>
);

export default CityInfoCard;
