import { useEffect, useState } from "react";
import { fetchCities } from "../lib/api";

/**
 * ProfileForm — bio, pronouns, home city, social handles.
 * Controlled component: `value` = { pronouns, bio, homeCity, socials }.
 * `onChange(patch)` emits partial updates.
 *
 * All fields optional — the empty state is valid.
 */
export const ProfileForm = ({ value, onChange }) => {
  const [cities, setCities] = useState([]);
  useEffect(() => { fetchCities().then(setCities).catch(() => {}); }, []);

  const set = (key, v) => onChange({ ...value, [key]: v });
  const setSocial = (key, v) => {
    const clean = (v || "").trim();
    const next = { ...(value.socials || {}) };
    if (clean) next[key] = clean; else delete next[key];
    onChange({ ...value, socials: next });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pronouns + Home City */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Pronouns (optional)
          </label>
          <input
            type="text"
            value={value.pronouns || ""}
            onChange={(e) => set("pronouns", e.target.value)}
            placeholder="she/her · he/him · they/them"
            maxLength={30}
            className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Home city
          </label>
          <select
            value={value.homeCity || ""}
            onChange={(e) => set("homeCity", e.target.value || null)}
            className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">— none —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
          Bio (optional, max 200)
        </label>
        <textarea
          value={value.bio || ""}
          onChange={(e) => set("bio", e.target.value.slice(0, 200))}
          placeholder="What's your vibe?"
          rows={2}
          className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 resize-none"
        />
        <div className="text-right text-[10px] text-gray-500 mt-0.5">
          {(value.bio || "").length} / 200
        </div>
      </div>

      {/* Social handles */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Social handles (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "twitter",   label: "Twitter / X", placeholder: "@yourname" },
            { key: "github",    label: "GitHub",      placeholder: "yourname" },
            { key: "instagram", label: "Instagram",   placeholder: "@yourname" },
            { key: "linkedin",  label: "LinkedIn",    placeholder: "in/yourname" },
            { key: "website",   label: "Website",     placeholder: "https://…" },
            { key: "farcaster", label: "Farcaster",   placeholder: "@yourname" },
          ].map((s) => (
            <div key={s.key}>
              <div className="text-[9px] text-gray-500 mb-0.5">{s.label}</div>
              <input
                type="text"
                value={(value.socials || {})[s.key] || ""}
                onChange={(e) => setSocial(s.key, e.target.value)}
                placeholder={s.placeholder}
                maxLength={200}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-2.5 py-1.5 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
