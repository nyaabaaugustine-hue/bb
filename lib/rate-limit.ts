type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastPrune = 0;

/** Best-effort per-instance limiter for public endpoints. */
export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (now - lastPrune > 60_000) {
    lastPrune = now;
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0 };
  current.count += 1;
  return { allowed: true, remaining: limit - current.count };
}

/** First forwarded address, falling back to a shared bucket for local requests. */
export function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "local";
}
