import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export async function POST() {
  const out = new NextResponse(null, { status: 204 });
  out.cookies.delete(SESSION_COOKIE);
  return out;
}
