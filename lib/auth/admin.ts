import { getRequestUser } from '@/lib/auth/request-user';
import { isAdminUser } from '@/lib/auth/users';

export async function getAdminRequestUser(request: Pick<Request, 'headers'>) {
  const user = await getRequestUser(request);
  return user && isAdminUser(user) ? user : null;
}
