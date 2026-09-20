import { createHmac, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { authDebug } from '@/lib/auth/debug';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.AUTH_SECRET;
  if (!clientId || !secret) {
    authDebug('signin-not-configured', { hasClientId: Boolean(clientId), hasAuthSecret: Boolean(secret) });
    return new NextResponse('Google sign-in is not configured', { status: 503 });
  }
  const state = randomBytes(24).toString('base64url');
  const signature = createHmac('sha256', secret).update(state).digest('base64url');
  const base = process.env.AUTH_URL ?? new URL(request.url).origin;
  authDebug('signin-started', { base, usesConfiguredAuthUrl: Boolean(process.env.AUTH_URL) });
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: `${base}/api/auth/callback/google`, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set('openmaic_oauth_state', `${state}.${signature}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  return response;
}
