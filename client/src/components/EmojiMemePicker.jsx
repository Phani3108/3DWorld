import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "./SocketManager";
import { fetchEmojiReactions, fetchMemes } from "../lib/api";

/**
 * EmojiMemePicker — popover-style picker for floating reactions.
 *
 * Fires `socket.emit("reaction", { type, value })` which the server validates
 * and broadcasts as `characterReaction`. Auto-closes on selection.
 */
export const EmojiMemePicker = ({ open, onClose }) => {
  const [tab, setTab] = useState("emoji");
  const [emojis, setEmojis] = useState(null);
  const [memes, setMemes] = useState(null);
  const [activeGroup, setActiveGroup] = useState("faces");

  useEffect(() => {
    if (!open) return;
    if (!emojis) fetchEmojiReactions().then(setEmojis).catch(() => {});
    if (!memes) fetchMemes().then(setMemes).catch(() => {});
  }, [open]);

  const send = (type, value) => {
    socket.emit("reaction", { type, value });
    onClose?.();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full right-0 mb-3 w-80 bg-[#1a1a2e] border border-sky-400/30 rounded-2xl shadow-2xl overflow-hidden z-50 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="flex border-b border-sky-400/15 text-xs font-semibold">
          <button
            className={`flex-1 py-2 transition-colors ${tab === "emoji" ? "bg-sky-500/20 text-sky-300" : "text-gray-400 hover:bg-sky-400/10"}`}
            onClick={() => setTab("emoji")}
          >
            😀 Emoji
          </button>
          <button
            className={`flex-1 py-2 transition-colors ${tab === "meme" ? "bg-sky-500/20 text-sky-300" : "text-gray-400 hover:bg-sky-400/10"}`}
            onClick={() => setTab("meme")}
          >
            🖼️ Meme
          </button>
        </div>

        {tab === "emoji" && (
          <div>
            {/* Group chips */}
            <div className="px-2 pt-2 pb-1 flex gap-1 flex-wrap border-b border-sky-400/10">
              {emojis && Object.keys(emojis).map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                    activeGroup === g
                      ? "bg-sky-500 text-white"
                      : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="p-2 max-h-56 overflow-y-auto">
              {!emojis ? (
                <div className="text-xs text-gray-500 text-center py-4">Loading…</div>
              ) : (
                <div className="grid grid-cols-8 gap-1">
                  {(emojis[activeGroup] || []).map((e) => (
                    <button
                      key={e}
                      onClick={() => send("emoji", e)}
                      className="aspect-square flex items-center justify-center rounded-lg hover:bg-slate-800 text-2xl transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "meme" && (
          <div className="p-2 max-h-64 overflow-y-auto">
            {!memes ? (
              <div className="text-xs text-gray-500 text-center py-4">Loading…</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {memes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => send("meme", m.id)}
                    className="group rounded-lg overflow-hidden border border-slate-700 hover:border-sky-400 bg-slate-900 transition-colors"
                    title={m.label}
                  >
                    <div className="aspect-square bg-slate-800 flex items-center justify-center text-3xl">
                      🖼️
                    </div>
                    <div className="px-1 py-1 text-[9px] text-gray-400 text-center leading-tight truncate">
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="text-[10px] text-gray-500 mt-2 px-1">
              Tip: meme images are shipped under <code className="text-sky-400">client/public/memes/</code>. The fallback icon shows until you drop in the WebPs.
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiMemePicker;
