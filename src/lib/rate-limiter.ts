/**
 * Lightweight Rate Limiter (In-Memory)
 * 
 * A simple in-memory rate limiter using Map for tracking request counts.
 * For production with multiple instances, use Redis-based solution.
 */

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 50, windowMs = 60000) {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, limit, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { 
      success: false, 
      remaining: 0, 
      retryAfter: Math.ceil((record.resetAt - now) / 1000) 
    };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, limit };
}

export function getRateLimitKey(userId: string, action: string) {
  return `ratelimit:${userId}:${action}`;
}
