import { matchBank, type World } from "@3dworld/content";
import type { AnswerChannel } from "@3dworld/contracts";

export type Answer = { text: string; channel: AnswerChannel };

/**
 * P1 resident brain: curated answers first, then an in-character redirect.
 * P2 puts Claude Opus 5.5 in front of this (streaming, tools, memory) and
 * keeps this path as the fallback when the model is off or over budget.
 */
export const answerFromContent = (
  world: World,
  residentId: string,
  question: string,
  pick: (n: number) => number = (n) => Math.floor(Math.random() * n),
): Answer | null => {
  const resident = world.residents.get(residentId);
  if (!resident) return null;
  const home = world.places.get(resident.homePlaceId);

  const personal = matchBank(resident.canned, question);
  if (personal) return { text: personal.answer, channel: "canned" };
  if (resident.role === "host" && home?.conversation) {
    const venue = matchBank(home.conversation.canned, question);
    if (venue) return { text: venue.answer, channel: "canned" };
  }

  const line = resident.lines[pick(resident.lines.length)] ?? "";
  const labels = new Map(world.expertise.map((t) => [t.id, t.label.toLowerCase()]));
  const topics = resident.expertise.slice(0, 3).map((t) => labels.get(t) ?? t);
  const offer = topics.length > 0 ? `Ask me about ${topics.join(", ")}.` : "";
  return { text: [line, offer].filter(Boolean).join(" ") || "Tell me more?", channel: "redirect" };
};
