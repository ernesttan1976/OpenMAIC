import { getRequestUser } from '@/lib/auth/request-user';

/**
 * Resolve the authenticated account identity and run a handler with its response headers.
 */
export async function withRequestOwnerId(
  req: Pick<Request, 'headers'>,
  handler: (ownerId: string, responseHeaders: Headers) => Promise<Response>,
): Promise<Response> {
  const responseHeaders = new Headers();
  try {
    const user = await getRequestUser(req);
    if (!user) return new Response('Authentication required', { status: 401, headers: responseHeaders });
    return await handler(user.id, responseHeaders);
  } catch (error) {
    console.error('[agent-runtime] authenticated request failed', error);
    return new Response('Internal Server Error', { status: 500, headers: responseHeaders });
  }
}
