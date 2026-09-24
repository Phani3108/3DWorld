import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { roomIDAtom, usernameAtom, charactersAtom } from "./SocketManager";
import { askAgent } from "../lib/api";

const friendlyError = (message = "") => {
  if (/→ 401/.test(message)) return "Your session expired — reload the page to reconnect.";
  if (/→ 429/.test(message)) return "Slow down a little — try again in a moment.";
  if (/not_in_room/.test(message)) return "Join a city first, then ask again.";
  return "Couldn't reach them just now. Try again?";
};

/**
 * AskAgentDialog — inline conversation inside ProfileCard for residents and
 * agents. Residents answer in the response (LLM, curated bank or an
 * in-character redirect), so the reply is shown right here and stays put;
 * the in-world speech bubble is a bonus, not the only record.
 * External agents may answer later — then the reply arrives in chat.
 */
export const AskAgentDialog = ({ bot }) => {
  const [roomID] = useAtom(roomIDAtom);
  const [username] = useAtom(usernameAtom);
  const [characters] = useAtom(charactersAtom);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState([]); // [{ who: "you" | "them" | "note", text }]
  const [error, setError] = useState(null);

  if (!bot || !bot.isBot) return null;

  const send = async () => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setThread((t) => [...t, { who: "you", text: trimmed }]);
    setQuestion("");
    try {
      const userId = localStorage.getItem("3dworld_user_id");
      const botInRoom = characters.find((c) => c.userId === bot.id || c.id === bot.id);
      const toBotId = botInRoom?.id || bot.id;
      const res = await askAgent(userId, username, toBotId, trimmed, roomID);
      if (res.answer) {
        setThread((t) => [...t, { who: "them", text: res.answer }]);
      } else {
        setThread((t) => [...t, { who: "note", text: `${bot.name} will reply in chat when they're back.` }]);
      }
    } catch (e) {
      setError(friendlyError(e.message));
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-6 pb-5 border-t border-[#2a2a3e] pt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          <span aria-hidden="true">🧠</span> Ask {bot.name}
        </button>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {thread.length > 0 && (
              <ol className="mb-3 space-y-2 max-h-56 overflow-y-auto pr-1" aria-live="polite" aria-label={`Conversation with ${bot.name}`}>
                {thread.map((m, i) => (
                  <li
                    key={i}
                    className={
                      m.who === "you"
                        ? "ml-8 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-gray-100"
                        : m.who === "them"
                          ? "mr-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-50"
                          : "text-xs text-gray-400 italic"
                    }
                  >
                    {m.who === "them" && <span className="block text-xs font-semibold text-emerald-300 mb-0.5">{bot.name}</span>}
                    {m.text}
                  </li>
                ))}
                {busy && <li className="mr-8 text-xs text-gray-400">{bot.name} is thinking…</li>}
              </ol>
            )}
            <label htmlFor={`ask-${bot.id}`} className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
              Ask {bot.name}
            </label>
            <textarea
              id={`ask-${bot.id}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
              onKeyDown={onKeyDown}
              placeholder={`What do you want to know from ${bot.name}?`}
              rows={2}
              className="w-full bg-[#0f0f0f] border border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between text-xs mt-1 text-gray-400">
              <span>Enter to send · answers are saved to your 🧠 library</span>
              <span className={question.length > 450 ? "text-rose-300" : undefined}>{question.length} / 500</span>
            </div>
            {error && (
              <div role="alert" className="mt-3 text-xs rounded px-3 py-2 border bg-rose-500/10 text-rose-200 border-rose-500/20">
                {error}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setOpen(false); setError(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-gray-200"
              >
                Close
              </button>
              <button
                onClick={send}
                disabled={busy || !question.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-gray-400 text-slate-900"
              >
                {busy ? "Asking…" : "Ask"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AskAgentDialog;
