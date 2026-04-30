import { useEffect, useState } from "react";
import soundManager from "../audio/SoundManager";

/**
 * MusicChip — Phase 10G.
 *
 * Compact "🔊 Track Title · CC0" chip rendered inside VenueInfoCard.
 * Polls the soundManager every second for the current track meta — Howler
 * doesn't expose an event for "music swap finished" so a 1 Hz poll is the
 * cheapest way to keep the chip in sync with crossfades.
 *
 * Renders nothing when no music is playing or when the track has no title
 * (e.g. when the asset 404'd and we silently fell through).
 */
export const MusicChip = () => {
  const [meta, setMeta] = useState(soundManager.currentTrack || null);

  useEffect(() => {
    const tick = () => {
      const next = soundManager.currentTrack || null;
      // Compare by key — JSON compare would over-fire because of identical objects
      setMeta((prev) => {
        if ((prev?.key || null) === (next?.key || null)) return prev;
        return next;
      });
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!meta || !meta.title) return null;

  // Render a license tag only when we have something other than CC0 (so
  // CC0 tracks stay clean; CC-BY shows the credit string for attribution).
  const showCredit = meta.license && meta.license !== "CC0";
  return (
    <span
      className="inline-flex items-center gap-1 text-pink-200 bg-pink-500/20 px-1.5 py-0.5 rounded"
      title={meta.source ? `${meta.source} (${meta.license || "unknown license"})` : meta.title}
    >
      <span>🔊</span>
      <span className="truncate max-w-[14ch]">{meta.title}</span>
      {showCredit && (
        <span className="opacity-60">· {meta.license}</span>
      )}
    </span>
  );
};

export default MusicChip;
