import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminRequestUser } from '@/lib/auth/admin';
import { AdminCourses } from './courses-client';

export default async function AdminCoursesPage() {
  const admin = await getAdminRequestUser({ headers: await headers() });
  if (!admin) redirect('/');
  return <AdminCourses />;
}
