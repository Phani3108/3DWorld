import { useState } from "react";
import { useAtom } from "jotai";
import { cityAtom, charactersAtom, userAtom } from "./SocketManager";
import { postMemory } from "../lib/api";

/**
 * ScreenshotButton — captures the current R3F canvas as a JPEG and uploads it
 * to /api/v1/memories. Nearby characters are auto-attached as "withUserIds" so
 * shared moments land in everyone's gallery.
 */
export const ScreenshotButton = () => {
  const [currentCity] = useAtom(cityAtom);
  const [characters] = useAtom(charactersAtom);
  const [user] = useAtom(userAtom);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState(null);

  const capture = async () => {
    if (busy) return;
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      setToast({ type: "error", text: "Canvas not ready." });
      return;
    }
    setBusy(true);
    // Flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 220);

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Find nearby characters (within 4 grid cells of the local user) for
      // the shared-moment attach. This is a client-side hint; the server
      // trusts it but caps to 12 entries.
      const me = characters.find((c) => c.id === user);
      const nearby = [];
      if (me?.position) {
        for (const c of characters) {
          if (!c || c.id === user) continue;
          if (!c.userId) continue;
          const dx = (c.position?.[0] ?? 0) - me.position[0];
          const dy = (c.position?.[1] ?? 0) - me.position[1];
          if (dx * dx + dy * dy <= 16) nearby.push(c.userId);
        }
      }

      const userId = localStorage.getItem("3dworld_user_id");
      const caption = currentCity
        ? `A moment in ${currentCity.id}`
        : "Captured a moment";

      const res = await postMemory(userId, dataUrl, caption, currentCity?.id || null, nearby);
      setToast({
        type: "ok",
        text: nearby.length > 0
          ? `Saved — shared with ${nearby.length} ${nearby.length === 1 ? "person" : "people"}.`
          : "Saved to your gallery.",
      });
      setTimeout(() => setToast(null), 2800);
    } catch (e) {
      setToast({ type: "error", text: e.message || "Upload failed" });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={capture}
        disabled={busy}
        className={`flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl cursor-pointer transition-colors group ${
          busy ? "opacity-60" : "hover:bg-pink-50"
        }`}
        title="Take a screenshot"
      >
        <span className="text-xl sm:text-2xl leading-none">📸</span>
        <span className="text-[10px] sm:text-xs text-pink-500 group-hover:text-pink-700 font-medium transition-colors">
          {busy ? "…" : "Capture"}
        </span>
      </button>

      {flash && (
        <div
          className="fixed inset-0 pointer-events-none z-[200] bg-white"
          style={{ animation: "shutterFlash 220ms ease-out forwards" }}
        />
      )}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[180] ${
            toast.type === "ok"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
      <style>{`
        @keyframes shutterFlash {
          0%   { opacity: 0; }
          15%  { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default ScreenshotButton;
