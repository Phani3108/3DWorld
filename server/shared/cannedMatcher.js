/**
 * Keyword matcher for the curated Q&A banks (venue + resident).
 *
 * Bank entries look like { keywords: string[], answer }. Matching is on
 * whole words and whole phrases, never substrings, so:
 *   • "What city is this?" can't hit an answer keyed on "it";
 *   • "Who is the current Nizam?" can't hit "weather" via "the";
 *   • single-word keywords that are stopwords or under 3 characters
 *     ("how", "and", "7") are ignored — multi-word phrases like
 *     "how long" still count because the whole phrase must appear.
 * Simple plural / -ing / -ed forms match ("cook" ↔ "cooking").
 */

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "so", "not", "no", "yes",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "do", "does", "did", "done", "have", "has", "had",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "mine", "yours",
  "this", "that", "these", "those", "there", "here",
  "what", "which", "who", "whom", "whose", "why", "how", "when", "where",
  "can", "could", "would", "should", "will", "shall", "may", "might", "must",
  "to", "of", "in", "on", "at", "for", "from", "with", "about", "as", "by", "into", "over", "than", "then",
  "tell", "know", "like", "just", "really", "very", "much", "more", "most", "some", "any", "all",
  "get", "got", "make", "made", "go", "going", "one", "thing", "things", "please", "thanks", "thank",
]);

/**
 * Lowercase, strip Latin accents, split into words. Marks (\p{M}) stay part
 * of the word so Devanagari/Arabic vowel signs don't split "हैदराबादी".
 */
export const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .match(/[\p{L}\p{M}\p{N}]+/gu) || [];

const sameWord = (token, kw) =>
  token === kw ||
  token === `${kw}s` || kw === `${token}s` ||
  token === `${kw}es` || kw === `${token}es` ||
  token === `${kw}ing` || kw === `${token}ing` ||
  token === `${kw}ed` || kw === `${token}ed`;

/** Does the keyword (word or phrase) appear as whole words in the question? */
const keywordHits = (questionTokens, keyword) => {
  const kw = tokenize(keyword);
  if (kw.length === 0) return false;
  if (kw.length === 1 && (kw[0].length < 3 || STOPWORDS.has(kw[0]))) return false;
  for (let i = 0; i + kw.length <= questionTokens.length; i++) {
    let all = true;
    for (let j = 0; j < kw.length; j++) {
      if (!sameWord(questionTokens[i + j], kw[j])) { all = false; break; }
    }
    if (all) return true;
  }
  return false;
};

/**
 * Best-matching entry of a bank for a question, or null.
 * Each matched keyword scores 2 (+1 for multi-word phrases); ties keep the
 * earlier entry.
 */
export const matchBank = (bank, question) => {
  if (!Array.isArray(bank) || bank.length === 0) return null;
  const q = tokenize(question);
  if (q.length === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const entry of bank) {
    let score = 0;
    for (const keyword of entry?.keywords || []) {
      if (keywordHits(q, keyword)) score += tokenize(keyword).length > 1 ? 3 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
};
