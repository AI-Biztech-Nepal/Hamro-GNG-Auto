import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimited } from '@/lib/rate-limit';
import { setSessionCookie } from '@/lib/session';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Records the account under Marketing > Leads > Accounts. The backend keeps one entry per email, so signing in again adds nothing.
 * A backend problem is only logged: it must never stop the visitor signing in.
 */
async function reportAccount(user: { name: string; email: string }) {
  try {
    const res = await fetch(`${API_BASE}/api/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The email is also written into the message so it shows on the admin's Leads screen, as the other forms do.
      body: JSON.stringify({ type: 'signup', name: user.name, phone: '', email: user.email, message: `Signed in with Google. Email: ${user.email}` }),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!res.ok) console.error(`Account lead rejected: ${res.status}`);
  } catch (error) {
    console.error('Account lead failed', error);
  }
}

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
  await reportAccount(user);
  const out = NextResponse.json(user);
  setSessionCookie(out, user);
  return out;
}
