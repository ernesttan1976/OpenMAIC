import { NextRequest, NextResponse } from 'next/server';

import { authDebug, isAuthDebugEnabled } from '@/lib/auth/debug';
import { getRequestUser } from '@/lib/auth/request-user';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  authDebug('browser-status-requested', { authenticated: Boolean(user) });
  return NextResponse.json({ debug: isAuthDebugEnabled(), authenticated: Boolean(user) });
}
