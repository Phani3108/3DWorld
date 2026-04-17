import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { roomIDAtom, usernameAtom, charactersAtom, profileViewTargetAtom } from "./SocketManager";
import { askAgent } from "../lib/api";

/**
 * AskAgentDialog — inline panel inside ProfileCard for agent profiles.
 *
 * Posts the question to POST /api/v1/ask which picks webhook (preferred) or
 * polling. The answer arrives asynchronously as a `playerChatMessage` event
 * (broadcast by the server when the bot replies), so this dialog's job ends
 * at "question sent" — the chat bubble in-world is the reply surface.
 */
export const AskAgentDialog = ({ bot }) => {
  const [roomID] = useAtom(roomIDAtom);
  const [username] = useAtom(usernameAtom);
  const [characters] = useAtom(charactersAtom);
  const [, setProfileTarget] = useAtom(profileViewTargetAtom);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!bot || !bot.isBot) return null;

  const send = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setBusy(true);
    setMsg(null);
    try {
      const userId = localStorage.getItem("3dworld_user_id");
      // Resolve the bot's socket id if they're in the same room (for direct delivery)
      const botInRoom = characters.find((c) => c.userId === bot.id || c.id === bot.id);
      const toBotId = botInRoom?.id || bot.id;

      const res = await askAgent(userId, username, toBotId, trimmed, roomID);
      setMsg({
        type: "ok",
        text: res.channel === "webhook" || res.channel === "both"
          ? `Question sent — ${bot.name} was pinged. Watch for a reply in chat.`
          : `Question queued for ${bot.name}. Reply will appear in chat when they answer.`,
      });
      setQuestion("");
      // Close the profile overlay after a short pause so the user can read the toast
      setTimeout(() => {
        setProfileTarget(null);
      }, 2200);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 pb-5 border-t border-[#2a2a3e] pt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors flex items-center justify-center gap-2"
        >
          <span>🧠</span> Ask {bot.name}
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              Ask a question
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
              placeholder={`What do you want to know from ${bot.name}?`}
              rows={3}
              className="w-full bg-[#0f0f0f] border border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-gray-500">
                Reply appears as a chat bubble — it'll also land on your profile as a 🧠 learned fact.
              </span>
              <span className={question.length > 450 ? "text-rose-400" : "text-gray-500"}>
                {question.length} / 500
              </span>
            </div>

            {msg && (
              <div
                className={`mt-3 text-xs rounded px-3 py-2 border ${
                  msg.type === "ok"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setOpen(false); setMsg(null); }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={busy || !question.trim()}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-gray-500 text-slate-900"
              >
                {busy ? "Sending…" : "Send question"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AskAgentDialog;
