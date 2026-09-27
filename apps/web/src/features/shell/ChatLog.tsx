import type { ChatMessage } from "@3dworld/contracts";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { chatAtom, sessionAtom, thinkingAtom } from "../../state/store.ts";

const CHANNEL_LABEL: Record<string, string> = {
  canned: "from the curated notes",
  redirect: "off-topic — suggested topics",
  llm: "improvised by Claude",
  stub: "demo reply",
};

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const Bubble = ({ m, selfId }: { m: ChatMessage; selfId: string | undefined }) => {
  if (m.from.kind === "system") {
    return <li className="text-center text-sm text-muted">{m.text}</li>;
  }
  const mine = m.from.kind === "player" && m.from.id === selfId;
  const resident = m.from.kind === "resident";
  return (
    <li className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <span className="text-xs text-muted">
        {resident ? <span className="font-semibold text-teal">{m.from.name}</span> : m.from.name}
        {m.to ? <> → {m.to.id === selfId ? "you" : m.to.name}</> : null} · {time(m.at)}
      </span>
      <p
        className={`mt-0.5 max-w-[92%] rounded-2xl px-3 py-2 ${
          resident
            ? "bg-panel-2 ring-1 ring-teal/40"
            : mine
              ? "bg-amber/15 ring-1 ring-amber/40"
              : "bg-panel-2"
        }`}
      >
        {m.text}
      </p>
      {resident && m.channel ? (
        <span className="mt-0.5 text-[11px] text-muted">
          {CHANNEL_LABEL[m.channel] ?? m.channel}
        </span>
      ) : null}
    </li>
  );
};

export const ChatLog = ({ residentNames }: { residentNames: Map<string, string> }) => {
  const chat = useAtomValue(chatAtom);
  const thinking = useAtomValue(thinkingAtom);
  const selfId = useAtomValue(sessionAtom)?.user.id;
  const end = useRef<HTMLLIElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever messages or typing indicators change
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [chat.length, thinking]);

  return (
    <div className="h-full overflow-y-auto pr-1">
      {chat.length === 0 ? (
        <p className="text-sm text-muted">
          Nothing said here yet. Type <kbd className="rounded bg-panel-2 px-1">@</kbd> and a
          resident's name to ask them something — they're AI characters who know their corner of the
          city.
        </p>
      ) : null}
      <ol className="space-y-3" aria-label="Conversation in this place">
        {chat.map((m) => (
          <Bubble key={m.id} m={m} selfId={selfId} />
        ))}
        {Object.entries(thinking).map(([residentId]) => (
          <li key={residentId} className="text-sm text-muted">
            {residentNames.get(residentId) ?? "A resident"} is thinking…
          </li>
        ))}
        <li ref={end} aria-hidden="true" />
      </ol>
    </div>
  );
};
