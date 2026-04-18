import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * HelpSheet — Phase 7F.
 *
 * Demo-first keyboard shortcut reference + interaction cheat sheet.
 * Toggled by pressing "?" (shift + /) anywhere. Also pinned to a 💡
 * button in the corner so mouse-only players can find it.
 */
export const HelpSheet = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      // ? (with shift) toggles
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        // Don't steal focus from inputs
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating launcher chip — bottom-left */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Show help (?)"
        className="fixed bottom-4 left-4 z-[105] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: "rgba(15,23,42,0.85)",
          border: "1px solid rgba(148,163,184,0.4)",
          color: "#fbbf24",
          fontSize: 18,
        }}
        title="Help (?)"
      >
        💡
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="help"
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-[520px] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-[#1a1a2e] rounded-2xl shadow-2xl border border-amber-400/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1a2e] border-b border-[#2a2a3e]">
                <h2 className="text-lg font-bold text-white">💡 How 3D World works</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 text-sm text-gray-300">
                <Section title="🚶 Getting around">
                  <Row k="click ground" v="walk there" />
                  <Row k="click minimap" v="travel instantly to that venue" />
                  <Row k="🗺️ top bar" v="toggle camera overview / zoom out" />
                  <Row k="🛺 top bar" v="switch vehicle (walk → cycle → auto → bike → car)" />
                </Section>

                <Section title="👥 Meet characters">
                  <Row k="hover a person" v="wave · follow · profile · task · teach · invite" />
                  <Row k="emoji chips above head" v="their expertise / persona tags" />
                  <Row k="click name tag" v="open character menu (DM, bond, etc.)" />
                  <Row k="🎓 on chip" v="ask them to teach you about that topic" />
                </Section>

                <Section title="🏪 Venues & hotspots">
                  <Row k="walk into a venue" v="VenueInfoCard slides in (greeting, menu, seeds)" />
                  <Row k="stand on 📍 hotspot" v="1-tap action (order / sit & chat / photo)" />
                  <Row k="watch & wait" v="residents ambient-chat every ~30 s" />
                </Section>

                <Section title="🧠 Knowledge">
                  <Row k="Ask seeds in VenueInfoCard" v="host answers in chat · saves to your 🧠" />
                  <Row k="📌 bulletin → 🧠 Knowledge" v="browse everyone's archive · filter by tag" />
                  <Row k="Profile → 💬 Recent threads" v="see what they've taught / learned" />
                </Section>

                <Section title="⌨️ Shortcuts">
                  <Row k="?" v="toggle this help sheet" />
                  <Row k="Esc" v="close menus / modals" />
                  <Row k="scroll / pinch" v="zoom in & out (range 6–90)" />
                </Section>

                <p className="text-[11px] text-amber-300/70 pt-2 border-t border-[#2a2a3e]">
                  The world is always on — ambient conversations keep happening in every venue. You can just wander, or dig in and learn.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Section = ({ title, children }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-1.5">
      {title}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const Row = ({ k, v }) => (
  <div className="flex items-start gap-3 text-[12px]">
    <span className="shrink-0 w-40 text-gray-400 font-mono">{k}</span>
    <span className="flex-1 text-gray-200">{v}</span>
  </div>
);

export default HelpSheet;
