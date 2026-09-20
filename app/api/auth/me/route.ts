import { getRequestUser } from '@/lib/auth/request-user';

export const runtime = 'nodejs';

/** Returns only the account identity needed to scope browser runtime storage. */
export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

  return Response.json({ id: user.id });
}
