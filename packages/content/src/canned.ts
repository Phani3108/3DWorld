import type { CannedAnswer } from "./schema.ts";

/**
 * Keyword matcher for curated answer banks. Matching is on whole words and
 * whole phrases, never substrings:
 *   • "What city is this?" can't hit an answer keyed on "it";
 *   • single-word keywords that are stopwords or under 3 characters are ignored;
 *     multi-word phrases like "how long" still count as a whole.
 * Simple plural / -ing / -ed forms match ("cook" ↔ "cooking").
 */

const STOPWORDS = new Set(
  (
    "a an the and or but if so not no yes is are was were be been being am do does did done have has had " +
    "i you he she it we they me him her us them my your his its our their mine yours this that these those " +
    "there here what which who whom whose why how when where can could would should will shall may might must " +
    "to of in on at for from with about as by into over than then tell know like just really very much more " +
    "most some any all get got make made go going one thing things please thanks thank"
  ).split(" "),
);

/** Lowercase, strip Latin accents, split into words. Combining marks stay inside words (Devanagari, Arabic). */
export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];

const SUFFIXES = ["s", "es", "ing", "ed"];
const sameWord = (token: string, kw: string) =>
  token === kw || SUFFIXES.some((s) => token === kw + s || kw === token + s);

const keywordHits = (question: string[], keyword: string) => {
  const kw = tokenize(keyword);
  const first = kw[0];
  if (first === undefined) return false;
  if (kw.length === 1 && (first.length < 3 || STOPWORDS.has(first))) return false;
  for (let i = 0; i + kw.length <= question.length; i++) {
    if (kw.every((word, j) => sameWord(question[i + j] ?? "", word))) return true;
  }
  return false;
};

/** Best entry for a question, or null. A word hit scores 2, a phrase hit 3; ties keep the earlier entry. */
export const matchBank = (bank: readonly CannedAnswer[], question: string): CannedAnswer | null => {
  const q = tokenize(question);
  if (q.length === 0) return null;
  let best: CannedAnswer | null = null;
  let bestScore = 0;
  for (const entry of bank) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (keywordHits(q, keyword)) score += tokenize(keyword).length > 1 ? 3 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
};
