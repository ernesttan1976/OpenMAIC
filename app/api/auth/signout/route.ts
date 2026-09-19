import { NextRequest, NextResponse } from 'next/server';
import { expiredSessionCookieHeader, readSessionPayload } from '@/lib/auth/session';
import { revokeUserSession } from '@/lib/auth/users';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = readSessionPayload(request.headers);
  if (session) await revokeUserSession(session.sessionId);
  const response = NextResponse.json({ ok: true });
  response.headers.append('Set-Cookie', expiredSessionCookieHeader());
  return response;
}
