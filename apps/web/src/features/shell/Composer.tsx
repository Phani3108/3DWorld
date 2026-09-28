import type { PublicResident } from "@3dworld/contracts";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { ask, say } from "../../lib/realtime.ts";
import { composerDraftAtom, narrate } from "../../state/store.ts";

const ERRORS: Record<string, string> = {
  rate_limited: "Slow down a little — try again in a few seconds.",
  not_found: "They aren't in this part of the city.",
  forbidden: "You're not in a room yet.",
  bad_request: "That message couldn't be sent.",
};

/** One box for everything: "@Name question" asks a resident; anything else is said to the room. */
export const Composer = ({ residents }: { residents: PublicResident[] }) => {
  const [draft, setDraft] = useAtom(composerDraftAtom);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mention = /^@(\S*)$/.exec(draft.trimStart());
  const suggestions = useMemo(() => {
    if (!mention) return [];
    const q = (mention[1] ?? "").toLowerCase();
    return residents.filter((r) => r.name.toLowerCase().startsWith(q)).slice(0, 6);
  }, [mention, residents]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setError(null);
    const m = /^@(\S+)\s+([\s\S]+)$/.exec(text);
    const target = m
      ? residents.find((r) => r.name.toLowerCase() === m[1]!.toLowerCase())
      : undefined;
    setBusy(true);
    try {
      const res = target ? await ask(target.id, m![2]!.trim()) : await say(text);
      if (!res.ok) {
        setError(ERRORS[res.error] ?? "Something went wrong.");
        return;
      }
      setDraft("");
    } catch {
      setError("The city server didn't answer. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="panel relative flex items-center gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      {suggestions.length > 0 ? (
        <ul
          aria-label="Residents you can ask"
          className="panel absolute bottom-full left-0 mb-2 w-72 p-1"
        >
          {suggestions.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="tap w-full rounded-lg px-3 text-left hover:bg-panel-2"
                onClick={() => {
                  setDraft(`@${r.name} `);
                  document.getElementById("composer-input")?.focus();
                }}
              >
                <span className="font-semibold">{r.name}</span>{" "}
                <span className="text-sm text-muted">— {r.bio}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <label htmlFor="composer-input" className="sr-only">
        Message. Start with @ and a name to ask a resident.
      </label>
      <input
        id="composer-input"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") (e.target as HTMLInputElement).blur();
        }}
        maxLength={500}
        autoComplete="off"
        placeholder="Say something, or @Farah how is dum biryani made?"
        className="tap min-w-0 flex-1 rounded-xl bg-ink px-4 placeholder:text-muted/80"
        aria-describedby={error ? "composer-error" : undefined}
      />
      <button
        type="submit"
        disabled={busy || !draft.trim()}
        className="tap rounded-xl bg-amber px-5 font-semibold text-amber-ink disabled:opacity-40"
        onClick={() => narrate("")}
      >
        {busy ? "…" : "Send"}
      </button>
      {error ? (
        <p id="composer-error" role="alert" className="absolute -top-7 left-3 text-sm text-rose">
          {error}
        </p>
      ) : null}
    </form>
  );
};
