import { readSessionPayload, type AuthenticatedUser } from './session';
import { authDebug, authDebugError } from './debug';
import { getAuthenticatedUser } from './users';

export async function getRequestUser(req: Pick<Request, 'headers'>): Promise<AuthenticatedUser | null> {
  const session = readSessionPayload(req.headers);
  if (!session) {
    authDebug('session-not-present-or-invalid');
    return null;
  }
  try {
    const user = await getAuthenticatedUser(session.userId, session.sessionId);
    authDebug('session-database-check', { authenticated: Boolean(user) });
    return user;
  } catch (error) {
    authDebugError('session-database-check-failed', error);
    throw error;
  }
}
