import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { languageAtom, greetingPopAtom, cityAtom } from "./SocketManager";

/**
 * LanguageBadge — tiny pill near the top-left showing the local dialect.
 * Click to expand a popover with the glossary + a sample greeting.
 * A transient greeting pop bursts on arrival for ~4s in the same place.
 */
export const LanguageBadge = () => {
  const [language] = useAtom(languageAtom);
  const [greetingPop] = useAtom(greetingPopAtom);
  const [city] = useAtom(cityAtom);
  const [open, setOpen] = useState(false);

  if (!language && !greetingPop) return null;

  const accent = city?.theme?.palette?.accent || "#38bdf8";

  return (
    <>
      {/* Arrival greeting pop */}
      <AnimatePresence>
        {greetingPop && (
          <motion.div
            key={greetingPop.at}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
          >
            <div
              className="px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border font-semibold text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${accent}cc, rgba(15,23,42,0.9))`,
                borderColor: `${accent}66`,
              }}
            >
              <div className="text-xs uppercase tracking-widest opacity-75 mb-0.5">
                {language?.script || city?.emoji}
              </div>
              <div className="text-base">{greetingPop.text}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language badge pill */}
      {language && (
        <div className="fixed top-4 left-4 z-[85] pointer-events-auto">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border text-xs font-semibold text-white hover:bg-slate-800/80 transition-colors"
            style={{ borderColor: `${accent}55` }}
            title="Click for glossary"
          >
            <span style={{ color: accent }}>●</span>
            <span>{language.script || language.name}</span>
            <span className="text-gray-400">▾</span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-80 bg-[#0f172a] rounded-xl shadow-2xl border overflow-hidden"
                style={{ borderColor: `${accent}33` }}
              >
                <div className="px-4 py-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white">{language.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {language.greetings?.[0] || ""}
                  </p>
                </div>

                {/* Filler words quick reference */}
                {language.filler && (
                  <div className="px-4 py-2 border-b border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                      You'll hear
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {language.filler.slice(0, 8).map((f) => (
                        <span
                          key={f}
                          className="text-[11px] bg-slate-800 text-gray-200 px-2 py-0.5 rounded-full"
                          title={language.glossary?.[f] || ""}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Glossary */}
                {language.glossary && Object.keys(language.glossary).length > 0 && (
                  <div className="px-4 py-2 max-h-48 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                      Glossary
                    </div>
                    <dl className="text-[11px] space-y-1">
                      {Object.entries(language.glossary).slice(0, 10).map(([word, meaning]) => (
                        <div key={word} className="flex gap-2">
                          <dt className="text-amber-300 font-semibold shrink-0">{word}</dt>
                          <dd className="text-gray-400 leading-snug">— {meaning}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default LanguageBadge;
