import { useEffect, useState } from "react";
import { fetchAccents } from "../lib/api";

/**
 * AccentPicker — 8 colour swatches. Selection tints the player's name tag,
 * speech bubble outline, and chat log name. Controlled component.
 */
export const AccentPicker = ({ value, onChange }) => {
  const [accents, setAccents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccents()
      .then((list) => { setAccents(list); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Accent colour</label>

      {loading ? (
        <div className="text-xs text-gray-500">Loading colours…</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {accents.map((c) => {
            const selected = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(c.id)}
                className={`group relative w-9 h-9 rounded-full transition-all ${
                  selected ? "ring-2 ring-offset-2 ring-offset-[#1a1a2e] scale-110" : "hover:scale-105"
                }`}
                style={{
                  backgroundColor: c.hex,
                  boxShadow: selected ? `0 0 0 2px ${c.hex}` : "inset 0 -2px 4px rgba(0,0,0,0.3)",
                }}
                title={c.label}
              >
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccentPicker;
