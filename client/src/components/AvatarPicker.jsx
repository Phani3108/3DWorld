import { useEffect, useState } from "react";
import { fetchAvatars } from "../lib/api";

/**
 * AvatarPicker — grid of catalog avatars + optional "paste custom RPM URL".
 *
 * Controlled component: `value` is the current `avatarUrl`; `onChange` is called
 * with the chosen URL. For the catalog entries, the URL is whitelisted by the
 * server; for custom URLs, the server's sanitizeAvatarUrl accepts any
 * `https://models.readyplayer.me/<id>.glb`.
 */
export const AvatarPicker = ({ value, onChange }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customUrl, setCustomUrl] = useState("");
  const [customError, setCustomError] = useState("");

  useEffect(() => {
    fetchAvatars()
      .then((list) => { setAvatars(list); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tryApplyCustom = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) { setCustomError("Paste a Ready Player Me .glb URL."); return; }
    if (!/^https:\/\/models\.readyplayer\.me\/[A-Za-z0-9]+\.glb$/.test(trimmed)) {
      setCustomError("URL must look like https://models.readyplayer.me/<id>.glb");
      return;
    }
    setCustomError("");
    onChange(trimmed);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pick an avatar</label>

      {loading ? (
        <div className="text-xs text-gray-500">Loading avatars…</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {avatars.map((a) => {
            const selected = value === a.url;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onChange(a.url)}
                className={`group relative rounded-xl p-2 border-2 transition-all ${
                  selected
                    ? "border-sky-400 bg-sky-400/10"
                    : "border-[#333] bg-[#0f0f0f] hover:border-gray-500"
                }`}
                title={a.label}
              >
                <div className="aspect-square rounded-md bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-2xl">
                  {a.tags?.includes("creature") ? "🐾" : "🧑"}
                </div>
                <div className="mt-1.5 text-[11px] text-gray-300 text-center truncate">
                  {a.label}
                </div>
                {selected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-400 flex items-center justify-center text-[9px] text-black font-bold">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 pt-3 border-t border-[#2a2a3e]">
        <div className="text-xs text-gray-500 mb-2">
          Or paste your own Ready Player Me avatar URL
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://models.readyplayer.me/…glb"
            className="flex-1 bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={tryApplyCustom}
            className="px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold"
          >
            Use
          </button>
        </div>
        {customError && (
          <div className="text-xs text-rose-400 mt-1.5">{customError}</div>
        )}
        <a
          href="https://readyplayer.me/avatar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] text-sky-400 hover:text-sky-300 mt-1.5"
        >
          Create one at readyplayer.me →
        </a>
      </div>
    </div>
  );
};

export default AvatarPicker;
