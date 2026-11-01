import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidPhone } from '@/lib/phone';
import { clientIp, rateLimited } from '@/lib/rate-limit';
import { readSession, SESSION_COOKIE, setSessionCookie } from '@/lib/session';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

const INTERESTS = {
  buy: 'Buying a bike',
  sell: 'Selling a bike',
  exchange: 'Exchanging a bike',
  service: 'Servicing',
} as const;

const bodySchema = z.object({
  phone: z.string().trim().max(20).refine(isValidPhone),
  interest: z.enum(['buy', 'sell', 'exchange', 'service']).optional(),
});

/**
 * Saves a signed-in visitor's phone number as a "signup" lead on the backend (it shows under Marketing > Leads).
 * Name and email come from the signed session, never from the request body, so only a verified Google account can create one.
 */
export async function POST(request: NextRequest) {
  const user = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return new NextResponse(null, { status: 401 });
  if (rateLimited(`phone:${user.sub}`, 5, 10 * 60_000) || rateLimited(`phone-ip:${clientIp(request)}`, 20, 10 * 60_000)) {
    return new NextResponse(null, { status: 429 });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return new NextResponse(null, { status: 400 });
  const { phone, interest } = body.data;

  try {
    const res = await fetch(`${API_BASE}/api/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The email is also written into the message so it shows on the admin's Leads screen, as the other forms do.
      body: JSON.stringify({
        type: 'signup',
        name: user.name,
        phone,
        email: user.email,
        message: `Signed in with Google.${interest ? ` Interested in: ${INTERESTS[interest]}.` : ''} Email: ${user.email}`,
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    const out = new NextResponse(null, { status: res.ok ? 200 : res.status });
    // The number rides in the signed session too, so the site knows this account is complete even if the browser forgets it.
    if (res.ok) setSessionCookie(out, { ...user, phone });
    return out;
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
