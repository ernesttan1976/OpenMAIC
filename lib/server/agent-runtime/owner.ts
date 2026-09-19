import { readSessionPayload } from '@/lib/auth/session';

/**
 * Resolve the signed application account id used to partition agent sessions.
 * The database-backed check happens in withRequestOwnerId; direct stream routes
 * use this signed envelope after middleware has admitted the request.
 */
export function resolveRequestOwnerId(
  req: Pick<Request, 'headers'>,
  _responseHeaders: Headers,
  authenticatedOwnerId?: string,
): string {
  if (authenticatedOwnerId) return authenticatedOwnerId;
  const session = readSessionPayload(req.headers);
  if (!session) throw new Error('Authentication required');
  return session.userId;
}
