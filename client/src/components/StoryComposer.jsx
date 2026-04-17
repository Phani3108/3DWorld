import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { cityAtom } from "./SocketManager";
import { postStory } from "../lib/api";

/**
 * StoryComposer — 280-char status post with emoji + current-city tag.
 * Controlled by a parent-provided `open` / `onClose`.
 */
export const StoryComposer = ({ open, onClose, onPosted }) => {
  const [currentCity] = useAtom(cityAtom);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) { setError("Say something first."); return; }
    setBusy(true);
    setError(null);
    try {
      const userId = localStorage.getItem("3dworld_user_id");
      const res = await postStory(userId, trimmed, currentCity?.id || null, emoji || undefined);
      setText("");
      setEmoji("");
      onPosted?.(res.story);
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const QUICK_EMOJI = ["✨", "🔥", "❤️", "😂", "🥹", "🌊", "🌞", "🎉", "🍛", "☕", "🌃", "💭"];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] grid place-items-center p-4"
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="relative bg-[#1a1a2e] border border-amber-400/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-amber-400/15">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📌</span> New story
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pinned to the world bulletin · visible from any city
                {currentCity && <> · tagged <span className="text-amber-300">{currentCity.emoji} {currentCity.id}</span></>}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-300 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder="What just happened? What are you thinking about?"
              rows={4}
              className="w-full bg-[#0f0f0f] border border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between text-[10px] mt-1.5">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Emoji:</span>
                <button
                  className={`text-xs px-2 py-0.5 rounded-full ${emoji ? "bg-amber-500/30" : "bg-slate-800"}`}
                  onClick={() => setEmoji("")}
                  title="Clear"
                >
                  {emoji || "—"}
                </button>
              </div>
              <span className={text.length > 250 ? "text-rose-400" : "text-gray-500"}>
                {text.length} / 280
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {QUICK_EMOJI.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`px-1.5 py-0.5 rounded-lg text-lg hover:bg-slate-800 transition-colors ${
                    emoji === e ? "bg-amber-500/30 ring-1 ring-amber-400" : ""
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 rounded px-3 py-2 border border-rose-500/20">
                {error}
              </div>
            )}
          </div>

          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={send}
              disabled={busy || !text.trim()}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-gray-500 text-slate-900 transition-colors"
            >
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoryComposer;
