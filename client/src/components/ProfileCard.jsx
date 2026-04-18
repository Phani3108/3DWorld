import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { profileViewTargetAtom } from "./SocketManager";
import { fetchProfile, fetchCity, fetchUserConversations } from "../lib/api";
import { AskAgentDialog } from "./AskAgentDialog";

const SOCIAL_ICONS = {
  twitter:   { label: "Twitter", emoji: "🐦", url: (h) => `https://twitter.com/${h}` },
  github:    { label: "GitHub",  emoji: "🐙", url: (h) => `https://github.com/${h}` },
  instagram: { label: "Instagram", emoji: "📷", url: (h) => `https://instagram.com/${h}` },
  linkedin:  { label: "LinkedIn", emoji: "💼", url: (h) => `https://linkedin.com/${h.startsWith("in/") ? h : "in/" + h}` },
  website:   { label: "Website", emoji: "🌐", url: (h) => h },
  farcaster: { label: "Farcaster", emoji: "🟪", url: (h) => `https://warpcast.com/${h}` },
};

/**
 * ProfileCard — overlay rendered when `profileViewTargetAtom` is set to a
 * user id. Closes when the user taps outside or presses Escape.
 */
export const ProfileCard = () => {
  const [targetId, setTargetId] = useAtom(profileViewTargetAtom);
  const [profile, setProfile] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [threads, setThreads] = useState([]); // Phase 7E.6
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetId) { setProfile(null); setCityInfo(null); setThreads([]); setError(null); return; }
    setLoading(true);
    setError(null);
    fetchProfile(targetId)
      .then(async (p) => {
        setProfile(p);
        if (p.homeCity) {
          try { setCityInfo(await fetchCity(p.homeCity)); } catch {}
        }
      })
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
    // Phase 7E.6 — load the archived Q&A threads this user has been in
    // (either as asker or as the answering resident). Fire-and-forget.
    fetchUserConversations(targetId, 8)
      .then((list) => { if (Array.isArray(list)) setThreads(list); })
      .catch(() => setThreads([]));
  }, [targetId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setTargetId(null); };
    if (targetId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [targetId, setTargetId]);

  if (!targetId) return null;

  const accentHex = "#38bdf8";
  const accent = profile?.accentId
    ? { sky:"#38bdf8", rose:"#fb7185", emerald:"#10b981", amber:"#f59e0b", violet:"#8b5cf6", teal:"#14b8a6", orange:"#fb923c", slate:"#64748b" }[profile.accentId] || accentHex
    : accentHex;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] grid place-items-center p-4"
        onClick={() => setTargetId(null)}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#1a1a2e] rounded-2xl w-full max-w-md shadow-2xl z-10 overflow-hidden"
          style={{ borderTop: `3px solid ${accent}` }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {/* Close */}
          <button
            onClick={() => setTargetId(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 text-lg leading-none z-10"
            aria-label="Close"
          >
            ×
          </button>

          {/* Loading / Error */}
          {loading && (
            <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
          )}
          {error && (
            <div className="p-8 text-center text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Body */}
          {profile && !loading && !error && (
            <>
              {/* Avatar band */}
              <div
                className="h-20 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}33, transparent)` }}
              >
                <div className="text-5xl">
                  {profile.isBot ? "🤖" : (cityInfo?.emoji || "🧑")}
                </div>
              </div>

              {/* Header */}
              <div className="px-6 pt-3 pb-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white">
                    {profile.name || "Unnamed"}
                  </h3>
                  {profile.pronouns && (
                    <span className="text-xs text-gray-400">({profile.pronouns})</span>
                  )}
                  {profile.isBot && (
                    <span className="text-[10px] bg-emerald-600/40 text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      Agent
                    </span>
                  )}
                </div>
                {cityInfo && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {cityInfo.emoji} {cityInfo.name}, {cityInfo.country}
                  </div>
                )}
              </div>

              {/* Phase 9C — Reputation chips (top cities) */}
              {Array.isArray(profile.reputation) && profile.reputation.length > 0 && (
                <div className="px-6 pb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    🏅 Reputation
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.reputation.map((r) => (
                      <span
                        key={r.cityId}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-100"
                        title={`${r.score} reputation in ${r.cityId}`}
                      >
                        <span>{r.tier?.emoji || "·"}</span>
                        <span className="capitalize">{r.cityId}</span>
                        <span className="text-amber-300/70">· {r.score}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 7H — Tier + XP progress */}
              {profile.tier && (
                <div className="px-6 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: profile.tier.tier.color,
                        background: `${profile.tier.tier.color}22`,
                        border: `1px solid ${profile.tier.tier.color}55`,
                      }}
                    >
                      {profile.tier.tier.emoji} {profile.tier.tier.label}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {profile.tier.xp} XP
                      {profile.tier.next && (
                        <>
                          {" · "}
                          <span className="text-gray-500">
                            {profile.tier.toNext} to {profile.tier.next.label}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  {profile.tier.next && (
                    <div className="mt-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, 100 * (profile.tier.xp - profile.tier.tier.threshold) / (profile.tier.next.threshold - profile.tier.tier.threshold)))}%`,
                          background: profile.tier.tier.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="px-6 pb-3 text-sm text-gray-300 leading-relaxed">
                  {profile.bio}
                </div>
              )}

              {/* Phase 7E.2/7E.3 — Expertise (residents) + persona tags
                  (humans). Both hydrated to { id, label, emoji, group }. */}
              {(() => {
                const chips = Array.isArray(profile.expertise) && profile.expertise.length > 0
                  ? profile.expertise
                  : (Array.isArray(profile.personaTags) ? profile.personaTags : []);
                if (chips.length === 0) return null;
                const heading = profile.isBot ? "🎓 Expertise" : "🎓 Persona";
                return (
                  <div className="px-6 pb-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      {heading}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((e) => (
                        <span
                          key={e.id}
                          className="inline-flex items-center gap-1 text-[11px] bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full"
                          title={e.group}
                        >
                          <span>{e.emoji}</span>
                          <span>{e.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Stats */}
              <div className="px-6 py-3 border-t border-[#2a2a3e] grid grid-cols-4 gap-2 text-center">
                <Stat label="Coins"    value={profile.stats?.coins ?? 0} />
                <Stat label="Stories"  value={profile.stats?.storyCount ?? 0} />
                <Stat label="Moments"  value={profile.stats?.memoryCount ?? 0} />
                <Stat label="Learned"  value={profile.stats?.factCount ?? 0} />
              </div>

              {/* Socials */}
              {profile.socials && Object.keys(profile.socials).length > 0 && (
                <div className="px-6 py-3 border-t border-[#2a2a3e] flex flex-wrap gap-1.5">
                  {Object.entries(profile.socials).map(([k, handle]) => {
                    const s = SOCIAL_ICONS[k]; if (!s) return null;
                    return (
                      <a
                        key={k}
                        href={s.url(handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-200 px-2 py-1 rounded-full inline-flex items-center gap-1"
                      >
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Learned facts (only if any) */}
              {profile.learnedFacts && profile.learnedFacts.length > 0 && (
                <div className="px-6 py-3 border-t border-[#2a2a3e]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    🧠 Recently learned
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {profile.learnedFacts.slice(0, 5).map((f) => (
                      <div key={f.id} className="text-xs text-gray-300">
                        <span className="text-gray-500">From </span>
                        <span className="text-sky-400">{f.fromBotName || "someone"}</span>
                        <span className="text-gray-500">: </span>
                        {f.answer?.slice(0, 140)}{(f.answer?.length ?? 0) > 140 ? "…" : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 7E.6 — Recent conversation threads (search-indexed archive) */}
              {threads.length > 0 && (
                <div className="px-6 py-3 border-t border-[#2a2a3e]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      💬 Recent threads
                    </div>
                    <span className="text-[10px] text-gray-500">{threads.length}</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {threads.map((t) => (
                      <div key={t.id} className="text-xs leading-snug">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span className="text-sky-400">
                            {t.toBotId === profile.id ? `asked by ${t.fromName || "someone"}` : `with ${t.toBotName || "someone"}`}
                          </span>
                          {t.venueName && (
                            <span className="text-gray-600">· {t.venueName}</span>
                          )}
                        </div>
                        <div className="text-gray-300 mt-0.5">
                          <span className="text-gray-500">Q:</span> {t.question?.slice(0, 120)}
                          {(t.question?.length ?? 0) > 120 ? "…" : ""}
                        </div>
                        <div className="text-gray-400">
                          <span className="text-gray-500">A:</span> {t.answer?.slice(0, 140)}
                          {(t.answer?.length ?? 0) > 140 ? "…" : ""}
                        </div>
                        {Array.isArray(t.tags) && t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {t.tags.slice(0, 5).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-1.5 py-[1px] rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent teaching count */}
              {profile.isBot && profile.stats?.teachingCount > 0 && (
                <div className="px-6 py-3 border-t border-[#2a2a3e] text-xs text-center text-emerald-400">
                  🎓 Has taught humans {profile.stats.teachingCount} times
                </div>
              )}

              {/* Ask-an-Agent — only for bot profiles */}
              {profile.isBot && <AskAgentDialog bot={profile} />}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
  </div>
);

export default ProfileCard;
