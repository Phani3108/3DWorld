import { useEffect, useState } from "react";
import { fetchAvatars } from "../lib/api";

/**
 * AvatarPicker — grid of the server's avatar catalog (self-hosted models
 * only; remote avatar URLs are rejected server-side).
 *
 * Controlled component: `value` is the current `avatarUrl`; `onChange` is
 * called with the chosen catalog URL.
 */
export const AvatarPicker = ({ value, onChange }) => {
  const [avatars, setAvatars] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    fetchAvatars()
      .then((list) => { setAvatars(Array.isArray(list) ? list : []); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <span id="avatar-picker-label" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Pick an avatar
      </span>

      {status === "loading" && <div className="text-xs text-gray-400">Loading avatars…</div>}
      {status === "error" && (
        <div className="text-xs text-rose-300">Couldn't load avatars — you'll start as the cat and can change it later.</div>
      )}
      {status === "ready" && (
        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="avatar-picker-label">
          {avatars.map((a) => {
            const selected = value === a.url;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onChange(a.url)}
                aria-pressed={selected}
                aria-label={a.label}
                className={`group relative rounded-xl p-2 border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  selected
                    ? "border-sky-400 bg-sky-400/10"
                    : "border-[#333] bg-[#0f0f0f] hover:border-gray-500"
                }`}
              >
                <div className="aspect-square rounded-md bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl" aria-hidden="true">
                  {a.emoji || "🐾"}
                </div>
                <div className="mt-1.5 text-xs text-gray-200 text-center truncate">{a.label}</div>
                {selected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center text-xs text-black font-bold" aria-hidden="true">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
