import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminRequestUser } from '@/lib/auth/admin';
import { AdminUsers } from './users-client';

export default async function AdminUsersPage() {
  const admin = await getAdminRequestUser({ headers: await headers() });
  if (!admin) redirect('/');
  return <AdminUsers />;
}
