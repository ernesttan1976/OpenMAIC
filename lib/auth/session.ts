import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const AUTH_SESSION_COOKIE = 'openmaic_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface SessionPayload {
  userId: string;
  sessionId: string;
  expiresAt: number;
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', authSecret()).update(value).digest('base64url');
}

function cookieValue(headers: Headers): string | undefined {
  const cookie = headers.get('cookie');
  return cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${AUTH_SESSION_COOKIE}=`))?.slice(AUTH_SESSION_COOKIE.length + 1);
}

export function readSessionPayload(headers: Headers): SessionPayload | null {
  const value = cookieValue(headers);
  if (!value) return null;
  const separator = value.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionPayload;
    return typeof parsed.userId === 'string' && typeof parsed.sessionId === 'string' && typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now() ? parsed : null;
  } catch {
    return null;
  }
}

export function createSessionCookie(userId: string, sessionId: string): { value: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, sessionId, expiresAt })).toString('base64url');
  return { value: `${payload}.${sign(payload)}`, expiresAt };
}

export function sessionCookieHeader(value: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function expiredSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}
