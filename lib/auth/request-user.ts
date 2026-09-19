import { readSessionPayload, type AuthenticatedUser } from './session';
import { getAuthenticatedUser } from './users';

export async function getRequestUser(req: Pick<Request, 'headers'>): Promise<AuthenticatedUser | null> {
  const session = readSessionPayload(req.headers);
  return session ? getAuthenticatedUser(session.userId, session.sessionId) : null;
}
