/**
 * Per-model token pricing (USD per million tokens) and a cost function
 * that understands prompt-cache usage. Used by the cost ledger so the
 * daily budget is enforced in dollars, not in guessed token counts.
 *
 * Cache writes: 5-minute TTL bills 1.25× input, 1-hour TTL bills 2×.
 * Cache reads bill the model's discounted read rate.
 */

export const MODEL_PRICING = {
  "claude-opus-5-5": { input: 4.0, output: 20.0, cacheRead: 0.2, cacheWrite5m: 5.0, cacheWrite1h: 8.0 },
  "claude-opus-5":   { input: 5.0, output: 25.0, cacheRead: 0.5, cacheWrite5m: 6.25, cacheWrite1h: 10.0 },
};

const FALLBACK_PRICING = MODEL_PRICING["claude-opus-5-5"];

export const pricingFor = (model) => {
  if (!model) return FALLBACK_PRICING;
  // Served model ids can carry suffixes; match on the longest known prefix.
  const key = Object.keys(MODEL_PRICING)
    .filter((id) => model === id || model.startsWith(`${id}-`))
    .sort((a, b) => b.length - a.length)[0];
  return key ? MODEL_PRICING[key] : FALLBACK_PRICING;
};

const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/**
 * USD cost of one Messages API response.
 * @param {object|null} usage  response.usage
 * @param {string} model       response.model (the model that actually served)
 */
export const costOfUsage = (usage, model) => {
  if (!usage) return 0;
  const p = pricingFor(model);
  const creation = usage.cache_creation || null;
  const write1h = n(creation?.ephemeral_1h_input_tokens);
  const write5m = creation
    ? n(creation.ephemeral_5m_input_tokens)
    : n(usage.cache_creation_input_tokens);
  const dollars =
    n(usage.input_tokens) * p.input +
    n(usage.output_tokens) * p.output +
    n(usage.cache_read_input_tokens) * p.cacheRead +
    write5m * p.cacheWrite5m +
    write1h * p.cacheWrite1h;
  return dollars / 1_000_000;
};
