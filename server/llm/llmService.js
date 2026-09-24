/**
 * llmService — "ask this resident a question; answer in their voice".
 *
 *   answerAsResident({ residentId, userId, userName, venueId, question, nearbyNames })
 *
 * Returns { ok: true, text, channel: "llm", ... } or { ok: false, reason }.
 * The Ask route treats ok:false as "fall back to the curated banks", so the
 * LLM is additive and never required.
 *
 * `userId` must already be verified against a session token by the caller;
 * memory and cost guards are keyed on it.
 */

import { getResident } from "../shared/residentCatalog.js";
import { getActiveProvider } from "./providerCatalog.js";
import { getMemory, recordTurn } from "./memoryStore.js";
import { canSpend, beginRequest } from "./costGuards.js";
import { costOfUsage } from "./pricing.js";
import { buildSystemBlocks, buildLiveContext } from "./promptBuilder.js";

const MAX_QUESTION_CHARS = 500;
const MAX_NAME_CHARS = 40;

const cleanName = (name) =>
  String(name || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_CHARS);

/** Prior turns as alternating user/assistant messages, starting with user. */
const historyMessages = (turns) => {
  const out = turns
    .filter((t) => t?.text)
    .map((t) => ({ role: t.role === "resident" ? "assistant" : "user", content: t.text }));
  while (out.length && out[0].role !== "user") out.shift();
  return out;
};

export const answerAsResident = async ({ residentId, userId, userName, venueId, question, nearbyNames = [] }) => {
  if (!residentId || !question || !userId) return { ok: false, reason: "missing_fields" };
  const resident = getResident(residentId);
  if (!resident) return { ok: false, reason: "resident_not_found" };

  const guard = canSpend(userId, residentId);
  if (!guard.ok) return { ok: false, reason: guard.reason, retryAfterMs: guard.retryAfterMs };

  const provider = getActiveProvider();
  const q = String(question).replace(/<[^>]*>/g, "").trim().slice(0, MAX_QUESTION_CHARS);
  if (!q) return { ok: false, reason: "empty_question" };
  const visitor = cleanName(userName);
  const turns = getMemory(residentId, userId);
  const messages = [...historyMessages(turns), { role: "user", content: q }];
  const liveContext = buildLiveContext({
    resident,
    visitorName: visitor || null,
    venueId,
    nearbyNames: nearbyNames.filter((n) => n !== resident.name),
    priorTurns: turns.length,
  });

  const done = beginRequest(userId, residentId);
  let costUsd = 0;
  try {
    const result = await provider.answer({
      system: buildSystemBlocks(resident),
      messages,
      liveContext,
      persona: resident,
    });
    costUsd = costOfUsage(result.usage, result.model);
    if (!result.ok) {
      return { ok: false, reason: result.error || "provider_failed", category: result.category, retryable: result.retryable };
    }
    recordTurn(residentId, userId, { userText: q, residentText: result.text });
    return {
      ok: true,
      text: result.text,
      channel: "llm",
      stub: !!result.stub,
      provider: provider.id,
      model: result.model,
      costUsd,
    };
  } catch (e) {
    return { ok: false, reason: "exception", detail: e?.message };
  } finally {
    done(costUsd);
  }
};
