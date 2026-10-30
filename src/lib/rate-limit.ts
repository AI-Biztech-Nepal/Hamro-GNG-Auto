import type { NextRequest } from 'next/server';

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window limiter, true when the caller is over `max` hits per `windowMs`.
 * shortcut: in-memory, per server process (fine on one Hostinger Node instance); use Redis/Upstash if scaled out.
 */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  const h = hits.get(key);
  if (!h || h.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  return ++h.count > max;
}

/** Visitor IP as seen by the proxy in front of us. */
export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
