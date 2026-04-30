/**
 * cannedAnswerService — Phase 9F (post-audit).
 *
 * Single indirection layer for all canned-answer lookups. Every Ask
 * handler now calls `matchCanned({ residentId, venueId, question })`
 * here instead of importing matchCannedAnswer / matchResidentCannedAnswer
 * directly.
 *
 * This is the foundation for monetization:
 *
 *   • By default the service uses the LOCAL catalogs in shared/. No env
 *     change needed; behaviour identical to before this refactor.
 *
 *   • Set CANNED_BANK_URL to a private API endpoint to remote-source
 *     answers instead. The remote contract is:
 *         POST /match
 *         body: { residentId, venueId, question }
 *         200:  { keywords?: [], answer: string, source?: string }
 *         404:  { error: "no_match" }
 *     The CANNED_BANK_KEY env var, if set, is sent as `x-api-key`.
 *
 *   • Failure modes (network error, 5xx, malformed JSON) all fall back
 *     to the LOCAL bank so the demo is never blank. The fallback
 *     decision is logged once per minute per remote-down event.
 *
 * Why this matters:
 *   The 168 venue + 42 personal answers represent ~30 hours of careful
 *   writing. Keeping them in the repo means anyone who clones gets the
 *   full corpus — there's no defensible content moat. Routing through
 *   this service means the same code can ship a slim "demo set" in
 *   the public repo and pull the rich set from a private API for
 *   licensed deployments.
 */

import { matchCannedAnswer } from "./shared/venueCatalog.js";
import { matchResidentCannedAnswer } from "./shared/residentQA.js";
import { getVenue } from "./shared/venueCatalog.js";

const REMOTE_URL     = process.env.CANNED_BANK_URL || "";
const REMOTE_KEY     = process.env.CANNED_BANK_KEY || "";
const REMOTE_TIMEOUT_MS = 5000;
const FAIL_LOG_THROTTLE_MS = 60_000;

let lastFailLogAt = 0;

const logFailureMaybe = (where, err) => {
  const now = Date.now();
  if (now - lastFailLogAt < FAIL_LOG_THROTTLE_MS) return;
  lastFailLogAt = now;
  console.warn(`[cannedAnswerService] remote ${where} failed — falling back to local. ${err}`);
};

const localMatch = ({ residentId, venueId, question }) => {
  // Personal bank first (Phase 7E.4 regulars), then venue bank.
  const personal = residentId ? matchResidentCannedAnswer(residentId, question) : null;
  if (personal) return { ...personal, source: "local-resident" };
  const venue = venueId ? getVenue(venueId) : null;
  const venueMatch = venue ? matchCannedAnswer(venue, question) : null;
  if (venueMatch) return { ...venueMatch, source: "local-venue" };
  return null;
};

const remoteMatch = async ({ residentId, venueId, question }) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REMOTE_TIMEOUT_MS);
  try {
    const res = await fetch(`${REMOTE_URL.replace(/\/$/, "")}/match`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(REMOTE_KEY ? { "x-api-key": REMOTE_KEY } : {}),
      },
      body: JSON.stringify({ residentId, venueId, question }),
      signal: ctrl.signal,
    });
    if (res.status === 404) return null;
    if (!res.ok) { logFailureMaybe(`status_${res.status}`, ""); return null; }
    const data = await res.json();
    if (!data || typeof data.answer !== "string") return null;
    return { ...data, source: data.source || "remote" };
  } catch (e) {
    logFailureMaybe(e?.name === "AbortError" ? "timeout" : "network", e?.message || "");
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Resolve a canned answer for an Ask. Tries remote (if configured),
 * always falls back to local on miss/error so the demo never blanks.
 *
 * @param {{ residentId?: string|null, venueId?: string|null, question: string }} input
 * @returns {Promise<{ keywords?: string[], answer: string, source: string } | null>}
 */
export const matchCanned = async ({ residentId, venueId, question }) => {
  if (!question) return null;
  if (REMOTE_URL) {
    const remote = await remoteMatch({ residentId, venueId, question });
    if (remote) return remote;
  }
  return localMatch({ residentId, venueId, question });
};

/** Diagnostic for /api/v1/llm/status-style health endpoints. */
export const cannedAnswerSourceInfo = () => ({
  remoteConfigured: !!REMOTE_URL,
  remoteUrl: REMOTE_URL ? new URL(REMOTE_URL).hostname : null, // host only, never the key
});
