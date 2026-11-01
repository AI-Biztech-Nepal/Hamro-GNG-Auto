import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimited } from '@/lib/rate-limit';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Verifies a Google Identity Services ID token with Google, then sets our signed session cookie. */
export async function POST(request: NextRequest) {
  if (!CLIENT_ID || !process.env.AUTH_SECRET) return new NextResponse(null, { status: 503 });
  if (rateLimited(`auth:${clientIp(request)}`, 20, 10 * 60_000)) return new NextResponse(null, { status: 429 });

  const { credential } = await request.json().catch(() => ({}));
  if (typeof credential !== 'string' || credential.length > 4000) return new NextResponse(null, { status: 400 });

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  }).catch(() => null);
  if (!res?.ok) return new NextResponse(null, { status: 401 });

  const t = await res.json();
  if (t.aud !== CLIENT_ID || t.email_verified !== 'true') return new NextResponse(null, { status: 401 });

  const user = { sub: t.sub, name: t.name || t.email, email: t.email, picture: t.picture };
  const out = NextResponse.json(user);
  out.cookies.set(SESSION_COOKIE, createSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return out;
}
