import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { createOpaqueToken, createSessionCookie, sessionCookieHeader } from '@/lib/auth/session';
import { authDebug, authDebugError, isAuthDebugEnabled } from '@/lib/auth/debug';
import { createUserSession, upsertGoogleUser } from '@/lib/auth/users';

export const runtime = 'nodejs';

function failure(message: string, status: number, stage: string): NextResponse {
  authDebug('google-callback-failed', { stage, status });
  if (!isAuthDebugEnabled()) return new NextResponse(message, { status });
  return new NextResponse(
    `<!doctype html><title>Google sign-in failed</title><pre>${message}\nDiagnostic stage: ${stage}\nCheck the browser console and server logs for [auth-debug].</pre><script>console.error('[auth-debug]', 'Google sign-in failed', { stage: ${JSON.stringify(stage)}, status: ${status} });</script>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const stored = request.cookies.get('openmaic_oauth_state')?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const secret = process.env.AUTH_SECRET;
  if (!code || !state || !stored || !clientId || !clientSecret || !secret) {
    return failure('Google sign-in failed', 400, 'missing-callback-requirements');
  }
  const [storedState, signature] = stored.split('.');
  const expected = createHmac('sha256', secret).update(state).digest('base64url');
  if (
    !storedState ||
    !signature ||
    storedState !== state ||
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return failure('Google sign-in state is invalid', 400, 'state-validation');
  }
  const base = process.env.AUTH_URL ?? new URL(request.url).origin;
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${base}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });
    const token = (await tokenResponse.json()) as { access_token?: string };
    authDebug('google-token-response', { ok: tokenResponse.ok, status: tokenResponse.status });
    if (!tokenResponse.ok || !token.access_token) return failure('Google sign-in failed', 401, 'token-exchange');
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };
    authDebug('google-profile-response', {
      ok: profileResponse.ok,
      status: profileResponse.status,
      hasSubject: Boolean(profile.sub),
      hasEmail: Boolean(profile.email),
      emailVerified: profile.email_verified === true,
    });
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) {
      return failure('A verified Google email is required', 403, 'profile-validation');
    }
    const user = await upsertGoogleUser({ subject: profile.sub, email: profile.email, name: profile.name, image: profile.picture });
    const sessionId = createOpaqueToken();
    const session = createSessionCookie(user.id, sessionId);
    await createUserSession(user.id, sessionId, session.expiresAt);
    authDebug('google-callback-succeeded', {
      userPersisted: true,
      sessionCookieSecure: process.env.NODE_ENV === 'production',
    });
    const response = NextResponse.redirect(new URL('/', base));
    response.headers.append('Set-Cookie', sessionCookieHeader(session.value));
    response.cookies.set('openmaic_oauth_state', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    authDebugError('google-callback-error', error, { stage: 'provider-or-database' });
    return failure('Google sign-in failed', 500, 'provider-or-database');
  }
}
