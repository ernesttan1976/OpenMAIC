import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { createOpaqueToken, createSessionCookie, sessionCookieHeader } from '@/lib/auth/session';
import { createUserSession, upsertGoogleUser } from '@/lib/auth/users';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const stored = request.cookies.get('openmaic_oauth_state')?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const secret = process.env.AUTH_SECRET;
  if (!code || !state || !stored || !clientId || !clientSecret || !secret) return new NextResponse('Google sign-in failed', { status: 400 });
  const [storedState, signature] = stored.split('.');
  const expected = createHmac('sha256', secret).update(state).digest('base64url');
  if (!storedState || !signature || storedState !== state || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return new NextResponse('Google sign-in state is invalid', { status: 400 });
  const base = process.env.AUTH_URL ?? new URL(request.url).origin;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${base}/api/auth/callback/google`, grant_type: 'authorization_code' }) });
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !token.access_token) return new NextResponse('Google sign-in failed', { status: 401 });
  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${token.access_token}` } });
  const profile = (await profileResponse.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) return new NextResponse('A verified Google email is required', { status: 403 });
  const user = await upsertGoogleUser({ subject: profile.sub, email: profile.email, name: profile.name, image: profile.picture });
  const sessionId = createOpaqueToken();
  const session = createSessionCookie(user.id, sessionId);
  await createUserSession(user.id, sessionId, session.expiresAt);
  const response = NextResponse.redirect(new URL('/', base));
  response.headers.append('Set-Cookie', sessionCookieHeader(session.value));
  response.cookies.set('openmaic_oauth_state', '', { maxAge: 0, path: '/' });
  return response;
}
