import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

/**
 * Same-origin relay for the Sell / Exchange / Book Service forms. The backend's CORS allow-list
 * doesn't include this site, so the browser blocked the direct POST and every lead was lost;
 * server-to-server calls aren't subject to CORS.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  try {
    const res = await fetch(`${API_BASE}/api/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    return new NextResponse(null, { status: res.ok ? 200 : res.status });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
