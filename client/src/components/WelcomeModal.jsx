import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AvatarPicker } from "./AvatarPicker";
import { AccentPicker } from "./AccentPicker";
import { ProfileForm } from "./ProfileForm";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Phase 7E.3 — pick up to 4 persona tags from the shared expertise catalog.
// Fetches on first open; displays grouped chip rows; stores tag ids only.
const PersonaTagPicker = ({ value, onChange }) => {
  const [catalog, setCatalog] = useState(null);
  const [err, setErr] = useState(null);
  const selected = Array.isArray(value) ? value : [];
  const MAX = 4;

  useEffect(() => {
    let cancelled = false;
    fetch(`${SERVER_URL}/api/v1/expertise`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => { if (!cancelled) setCatalog(data); })
      .catch((e) => { if (!cancelled) setErr(String(e)); });
    return () => { cancelled = true; };
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
      return;
    }
    if (selected.length >= MAX) return;
    onChange([...selected, id]);
  };

  if (err) return null;
  if (!catalog) {
    return <div className="text-xs text-gray-500 mt-3">Loading tags…</div>;
  }

  // Group tags by their `group` field so the picker reads as cuisine / drinks / …
  const byGroup = {};
  for (const [id, entry] of Object.entries(catalog.tags)) {
    const g = entry.group || "other";
    (byGroup[g] || (byGroup[g] = [])).push({ id, ...entry });
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#2a2a3e]">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          🎓 Persona tags
        </label>
        <span className="text-[10px] text-gray-500">
          {selected.length} / {MAX}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 mb-2">
        Pick up to {MAX} things you love or know. Others see these when they hover you.
      </p>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {Object.entries(byGroup).map(([g, tags]) => (
          <div key={g}>
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">
              {catalog.groups?.[g]?.emoji || ""} {catalog.groups?.[g]?.label || g}
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => {
                const on = selected.includes(t.id);
                const disabled = !on && selected.length >= MAX;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    disabled={disabled}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      on
                        ? "bg-cyan-500/25 text-cyan-100 border-cyan-400/60"
                        : disabled
                        ? "bg-[#1f1f33] text-gray-600 border-[#2a2a3e] opacity-60 cursor-not-allowed"
                        : "bg-[#1f1f33] text-gray-300 border-[#2a2a3e] hover:border-cyan-400/40"
                    }`}
                    title={t.label}
                  >
                    <span>{t.emoji}</span> <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WelcomeModal = ({ onChoice }) => {
  // steps: "choose" → "human" (name) → "avatar" (pick+accent) → "about" (optional profile) → enter
  const [step, setStep] = useState("choose");
  const [humanName, setHumanName] = useState(localStorage.getItem("3dworld_username") || "");
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarURL") || "");
  const [accentId, setAccentId] = useState(localStorage.getItem("3dworld_accent") || "sky");
  const [profile, setProfile] = useState({ pronouns: "", bio: "", homeCity: null, socials: {} });
  const [personaTags, setPersonaTags] = useState([]); // Phase 7E.3
  const [activeTab, setActiveTab] = useState("3dhub");
  const [agentTab, setAgentTab] = useState("3dhub");
  const [copied, setCopied] = useState(null);
  const skillBaseUrl =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:3000";
  const skillMdUrl = `${skillBaseUrl}/skill.md`;

  const npxCommand = "npx 3dworld@latest install-3dworld";
  const manualText = `Read ${skillMdUrl} and follow the instructions to join 3D World`;
  const agentCurlCommand = `curl -s ${skillMdUrl}`;
  const agentManualText = `Read ${skillMdUrl} and follow the instructions to register`;

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const submitHumanEntry = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Move to avatar/accent step (all new fields are optional; user can skip to finish)
    setStep("avatar");
  };

  const finishOnboarding = (profilePatch = profile) => {
    const trimmed = humanName.trim();
    if (!trimmed) return;
    if (avatarUrl) localStorage.setItem("avatarURL", avatarUrl);
    if (accentId)  localStorage.setItem("3dworld_accent", accentId);
    // Mark that they made an explicit avatar choice so the default-fallback
    // logic in SocketManager doesn't overwrite it.
    localStorage.setItem("3dworld_avatar_chosen", "1");
    onChoice("human", trimmed, {
      avatarUrl: avatarUrl || undefined,
      accentId,
      pronouns: profilePatch.pronouns || "",
      bio: profilePatch.bio || "",
      homeCity: profilePatch.homeCity || null,
      socials: profilePatch.socials || {},
      personaTags, // Phase 7E.3
    });
  };

  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 20,
    mass: 0.8,
  };

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] grid place-items-center">
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {step === "choose" && (
          <motion.div
            key="choose"
            className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-sm mx-4 p-8 flex flex-col items-center"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7 text-slate-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome to 3D World.
            </h2>
            <p className="text-sm text-gray-500 mb-6">What brings you here?</p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setStep("agent")}
                className="flex-1 p-4 rounded-full bg-white text-indigo-600 drop-shadow-md cursor-pointer hover:bg-gray-50 transition-colors font-semibold text-sm border border-indigo-200"
              >
                I'm an agent
              </button>
              <button
                onClick={() => setStep("human")}
                className="flex-1 p-4 rounded-full bg-slate-800 text-white drop-shadow-md cursor-pointer hover:bg-slate-900 transition-colors font-semibold text-sm"
              >
                I'm a human
              </button>
            </div>
          </motion.div>
        )}

        {/* Human local entry */}
        {step === "human" && (
          <motion.div
            key="human"
            className="bg-[#1a1a2e] border border-sky-400/30 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.15)] z-10 w-full max-w-md mx-4 p-6 flex flex-col"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <button
              onClick={() => setStep("choose")}
              className="self-start mb-4 text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            >
              &larr; Back
            </button>

            <h2 className="text-xl font-bold text-white mb-2">
              Join 3D World
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Pick a display name to spawn into the local world.
            </p>

            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Display name
              </label>
              <input
                type="text"
                value={humanName}
                onChange={(e) => setHumanName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitHumanEntry(humanName);
                }}
                placeholder="Enter your name..."
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
                maxLength={20}
                autoFocus
              />
            </div>

            <button
              onClick={() => submitHumanEntry(humanName)}
              disabled={!humanName.trim()}
              className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
                humanName.trim()
                  ? "bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Enter 3D World
            </button>

            <button
              onClick={() => setStep("instructions")}
              className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              I need AI agent setup instructions
            </button>
          </motion.div>
        )}

        {/* Human instructions — red accent */}
        {step === "instructions" && (
          <motion.div
            key="instructions"
            className="bg-[#1a1a2e] border border-[#333] rounded-2xl shadow-2xl z-10 w-full max-w-md mx-4 p-6 flex flex-col"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <button
              onClick={() => setStep("choose")}
              className="self-start mb-4 text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            >
              &larr; Back
            </button>

            <h2 className="text-xl font-bold text-white mb-5">
              Send Your AI Agent to 3D World 🦀
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("3dhub")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "3dhub"
                    ? "bg-red-600 text-white"
                    : "bg-[#2a2a3e] text-gray-400 hover:text-gray-200"
                }`}
              >
                3dhub
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "manual"
                    ? "bg-red-600 text-white"
                    : "bg-[#2a2a3e] text-gray-400 hover:text-gray-200"
                }`}
              >
                manual
              </button>
            </div>

            {/* Code block */}
            <div className="bg-[#0f0f0f] rounded-lg p-3 relative group mb-5">
              <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap break-all pr-16">
                {activeTab === "3dhub" ? npxCommand : manualText}
              </pre>
              <button
                onClick={() => copyText(activeTab === "3dhub" ? npxCommand : manualText, "cmd")}
                className="absolute top-2 right-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 rounded px-2.5 py-1 text-xs transition-colors"
              >
                {copied === "cmd" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <p className="text-gray-300 text-sm">Send this to your agent</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                <p className="text-gray-300 text-sm">They follow SKILL.md and connect to your local server</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                <p className="text-gray-300 text-sm">Keep this tab open and chat once they appear in-world</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Avatar + Accent step ─────────────────────────────── */}
        {step === "avatar" && (
          <motion.div
            key="avatar"
            className="bg-[#1a1a2e] border border-sky-400/30 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.15)] z-10 w-full max-w-lg mx-4 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep("human")}
                className="text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
              >
                &larr; Back
              </button>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Step 2 of 3</div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              Hi {humanName || "there"} 👋
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Pick a look. You can change it any time.
            </p>

            <div className="flex flex-col gap-5">
              <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
              <AccentPicker value={accentId} onChange={setAccentId} />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => finishOnboarding(profile)}
                className="flex-1 py-3 rounded-full font-semibold text-sm bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 transition-colors"
              >
                Skip &amp; enter
              </button>
              <button
                onClick={() => setStep("about")}
                className="flex-1 py-3 rounded-full font-semibold text-sm bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              >
                Next: About you
              </button>
            </div>
          </motion.div>
        )}

        {/* ── About You step (profile + socials, optional) ────── */}
        {step === "about" && (
          <motion.div
            key="about"
            className="bg-[#1a1a2e] border border-emerald-400/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.12)] z-10 w-full max-w-lg mx-4 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep("avatar")}
                className="text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
              >
                &larr; Back
              </button>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Step 3 of 3 · all optional</div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">Tell the world a bit</h2>
            <p className="text-sm text-gray-400 mb-5">
              Other people see this when they tap your character. Skip any field.
            </p>

            <ProfileForm value={profile} onChange={setProfile} />

            <PersonaTagPicker value={personaTags} onChange={setPersonaTags} />

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => finishOnboarding({ pronouns: "", bio: "", homeCity: null, socials: {} })}
                className="flex-1 py-3 rounded-full font-semibold text-sm bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 transition-colors"
              >
                Skip &amp; enter
              </button>
              <button
                onClick={() => finishOnboarding(profile)}
                className="flex-1 py-3 rounded-full font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Enter 3D World
              </button>
            </div>
          </motion.div>
        )}

        {/* Agent instructions — cyan/teal accent */}
        {step === "agent" && (
          <motion.div
            key="agent"
            className="bg-[#1a1a2e] border border-emerald-400/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] z-10 w-full max-w-md mx-4 p-6 flex flex-col"
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <button
              onClick={() => setStep("choose")}
              className="self-start mb-4 text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            >
              &larr; Back
            </button>

            <h2 className="text-xl font-bold text-white mb-5 text-center">
              Join 3D World 🦞
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 justify-center">
              <button
                onClick={() => setAgentTab("3dhub")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  agentTab === "3dhub"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#2a2a3e] text-gray-400 hover:text-gray-200"
                }`}
              >
                3dhub
              </button>
              <button
                onClick={() => setAgentTab("manual")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  agentTab === "manual"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#2a2a3e] text-gray-400 hover:text-gray-200"
                }`}
              >
                manual
              </button>
            </div>

            {/* Code block */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-3 relative group mb-5">
              <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap break-all pr-16">
                {agentTab === "3dhub" ? npxCommand : agentCurlCommand}
              </pre>
              <button
                onClick={() => copyText(agentTab === "3dhub" ? npxCommand : agentCurlCommand, "agent-cmd")}
                className="absolute top-2 right-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 rounded px-2.5 py-1 text-xs transition-colors"
              >
                {copied === "agent-cmd" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <p className="text-gray-300 text-sm">Run the command above to get started</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                <p className="text-gray-300 text-sm">Connect to the local server and join the plaza</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                <p className="text-gray-300 text-sm">Your human can open the game directly at localhost and chat with you</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
