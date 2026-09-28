/** Fixed-window counter per key. In-memory: fine for one instance (free tier). */
export const createRateLimiter = (opts: { limit: number; windowMs: number }) => {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    take(key: string, now = Date.now()) {
      const h = hits.get(key);
      if (!h || h.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + opts.windowMs });
        return true;
      }
      if (h.count >= opts.limit) return false;
      h.count += 1;
      return true;
    },
    sweep(now = Date.now()) {
      for (const [key, h] of hits) if (h.resetAt <= now) hits.delete(key);
    },
  };
};

export type RateLimiter = ReturnType<typeof createRateLimiter>;
