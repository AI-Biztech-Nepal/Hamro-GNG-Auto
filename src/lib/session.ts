import { createHmac, timingSafeEqual } from 'crypto';
import type { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'gg_session';
export const SESSION_MAX_AGE = 30 * 24 * 3600;

export type SessionUser = { sub: string; name: string; email: string; picture?: string; phone?: string };

const sign = (data: string) => createHmac('sha256', process.env.AUTH_SECRET ?? '').update(data).digest('base64url');

export function createSession(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString('base64url');
  return `${body}.${sign(body)}`;
}

/** Puts the signed session cookie on a response: at sign-in, and again once the visitor has added their phone number. */
export function setSessionCookie(res: NextResponse, user: SessionUser) {
  res.cookies.set(SESSION_COOKIE, createSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function readSession(token?: string): SessionUser | null {
  if (!token || !process.env.AUTH_SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { exp, ...user } = JSON.parse(Buffer.from(body, 'base64url').toString());
    return exp > Date.now() ? user : null;
  } catch {
    return null;
  }
}
