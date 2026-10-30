import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientIp, rateLimited } from '@/lib/rate-limit';

const API_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://api.hamroauto.com.np';

// Six compressed photos are ~1.5MB of base64; anything far above that is abuse.
const MAX_BODY_BYTES = 3_000_000;

const leadSchema = z.object({
  type: z.enum(['sell', 'exchange', 'service']),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20).regex(/^[0-9+\-\s()]+$/),
  message: z.string().max(2000).optional(),
  images: z.array(z.string().max(700_000).regex(/^data:image\/(jpeg|png|webp);base64,/)).max(8).optional(),
  requested_service: z.string().max(100).optional(),
  vehicle_type: z.string().max(100).optional(),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Same-origin relay for the Sell / Exchange / Book Service forms. The backend's CORS allow-list
 * doesn't include this site, so the browser blocked the direct POST and every lead was lost;
 * server-to-server calls aren't subject to CORS.
 */
export async function POST(request: NextRequest) {
  if (rateLimited(`lead:${clientIp(request)}`, 5, 10 * 60_000)) {
    return new NextResponse(null, { status: 429 });
  }
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  let lead;
  try {
    lead = leadSchema.safeParse(JSON.parse(body));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!lead.success) return new NextResponse(null, { status: 400 });

  try {
    const res = await fetch(`${API_BASE}/api/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead.data), // only the validated fields are forwarded
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    return new NextResponse(null, { status: res.ok ? 200 : res.status });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
