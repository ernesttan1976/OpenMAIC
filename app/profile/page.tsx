import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRequestUser } from '@/lib/auth/request-user';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

function userInitials(name: string | null, email: string): string {
  return (name || email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default async function ProfilePage() {
  const user = await getRequestUser({ headers: await headers() });
  if (!user) redirect('/api/auth/signin');

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-20">
      <section className="w-full rounded-2xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <div className="mt-6 flex items-center gap-5">
          <Avatar size="lg" className="size-16">
            {user.image && <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback>{userInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{user.name || user.email}</h1>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
