// Small in-memory rate limiter for login and the public forms.
// shortcut: counters live in this server process, so they reset on restart and
// are not shared between instances. Fine for the single-container deployment;
// move to Redis or the reverse proxy if the site ever runs on several.

const buckets = new Map();
const MAX_KEYS = 5000;

/**
 * Counts one attempt for `key` and says whether it is allowed.
 * Returns { ok, retryAfter } where retryAfter is in seconds.
 */
export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    // Forget expired entries before the map can grow without bound.
    if (buckets.size >= MAX_KEYS) for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}

// The caller's address as reported by the reverse proxy.
export function clientAddress(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown").trim();
}
