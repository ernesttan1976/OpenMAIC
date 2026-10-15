import { getRequestUser } from '@/lib/auth/request-user';
import { isAdminUser } from '@/lib/auth/users';

export const runtime = 'nodejs';

/** Returns only the account identity needed to scope browser runtime storage. */
export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

  return Response.json({ id: user.id, email: user.email, name: user.name, role: isAdminUser(user) ? 'admin' : user.role });
}
