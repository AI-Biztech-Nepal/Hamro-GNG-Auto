import { NextRequest, NextResponse } from 'next/server';
import { readSession, SESSION_COOKIE } from '@/lib/session';

export async function GET(request: NextRequest) {
  return NextResponse.json(readSession(request.cookies.get(SESSION_COOKIE)?.value), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
