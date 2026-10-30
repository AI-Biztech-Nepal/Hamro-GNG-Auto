import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimited } from '@/lib/rate-limit';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

const ACTIONS = ['check', 'spin'] as const;

/**
 * Same-origin relay for the Offers page's bike-number check and wheel spin (`code` is the
 * bike's number plate -- one spin per bike). The browser
 * talks to this route instead of api.hamroauto.com.np directly, so the Offers tab doesn't
 * depend on the backend's CORS allow-list including this site.
 */
export async function POST(request: NextRequest) {
  if (rateLimited(`spin:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, msg: 'Too many tries. Please wait a minute or ask our staff.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, msg: 'Unknown request.' }, { status: 400 });
  }

  // Pass the visitor's address on so the backend's per-visitor rate limit isn't shared
  // by everyone coming through this server.
  const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim();

  try {
    const res = await fetch(`${API_BASE}/api/public/offers/dashain/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(visitorIp ? { 'X-Forwarded-For': visitorIp } : {}),
      },
      body: JSON.stringify({ code: body.code, name: body.name, phone: body.phone }),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (res.status === 429) {
      return NextResponse.json({ ok: false, msg: 'Too many tries. Please wait a minute or ask our staff.' });
    }
    if (!res.ok) {
      return NextResponse.json({ ok: false, msg: 'Something went wrong. Please ask our staff.' });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ ok: false, msg: 'Connection problem. Please try again.' });
  }
}
