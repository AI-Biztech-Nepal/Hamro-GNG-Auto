import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';

const safeEqual = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * On-demand revalidation, called by the Auto-Stock-Manager backend right after an
 * inventory/settings change. Without this, pages relying on the `storefront-data`
 * fetch tag (see src/lib/inventory-api.ts) only refresh every 60s via ISR.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret') ?? '';
  if (!process.env.REVALIDATE_SECRET || !safeEqual(secret, process.env.REVALIDATE_SECRET)) {
    return NextResponse.json({ revalidated: false, message: 'Invalid secret' }, { status: 401 });
  }
  revalidateTag('storefront-data');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
