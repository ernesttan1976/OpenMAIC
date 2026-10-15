'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  invited?: boolean;
}

export function AdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const loadUsers = useCallback(async () => {
    const response = await fetch('/api/admin/users', { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? 'Could not load users');
    setUsers(body.users);
  }, []);

  useEffect(() => {
    void loadUsers().catch((caught: Error) => setError(caught.message));
  }, [loadUsers]);

  async function addUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Could not add user');
      setEmail('');
      setName('');
      setRole('user');
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add user');
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(user: ManagedUser, changes: Partial<ManagedUser>) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: changes.name ?? user.name ?? '', role: changes.role ?? user.role }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Could not update user');
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update user');
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Delete the account for ${user.email}?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Could not delete user');
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete user');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>
          <h1 className="text-3xl font-semibold">User management</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link className="rounded-lg border px-4 py-2 hover:bg-muted" href="/admin/courses">Courses</Link>
          <Link className="rounded-lg border px-4 py-2 hover:bg-muted" href="/profile">Account</Link>
        </div>
      </div>

      <form onSubmit={addUser} className="mb-8 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-[1.4fr_1fr_150px_auto]">
        <label className="grid gap-1 text-sm">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 rounded-md border bg-background px-3" /></label>
        <label className="grid gap-1 text-sm">Name<input value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-md border bg-background px-3" /></label>
        <label className="grid gap-1 text-sm">Role<select value={role} onChange={(event) => setRole(event.target.value as 'admin' | 'user')} className="h-10 rounded-md border bg-background px-3"><option value="user">User</option><option value="admin">Admin</option></select></label>
        <button disabled={busy} className="self-end rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">Invite user</button>
      </form>

      {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[1fr_1fr_130px_130px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Name</span><span>Email</span><span>Role</span><span>Account</span>
        </div>
        {users.map((user) => (
          <UserRow key={user.id} user={user} busy={busy} onUpdate={updateUser} onDelete={deleteUser} />
        ))}
        {users.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No users found.</p>}
      </section>
    </main>
  );
}

function UserRow({ user, busy, onUpdate, onDelete }: {
  user: ManagedUser;
  busy: boolean;
  onUpdate: (user: ManagedUser, changes: Partial<ManagedUser>) => Promise<void>;
  onDelete: (user: ManagedUser) => Promise<void>;
}) {
  const [name, setName] = useState(user.name ?? '');
  return (
    <div className="grid grid-cols-[1fr_1fr_130px_130px] items-center gap-4 border-b px-5 py-3 last:border-b-0">
      <input aria-label={`Name for ${user.email}`} value={name} onChange={(event) => setName(event.target.value)} onBlur={() => { if (name !== (user.name ?? '')) void onUpdate(user, { name }); }} className="h-9 min-w-0 rounded-md border bg-background px-2 text-sm" />
      <span className="truncate text-sm">{user.email}</span>
      <select aria-label={`Role for ${user.email}`} value={user.role} disabled={busy} onChange={(event) => void onUpdate(user, { role: event.target.value as 'admin' | 'user' })} className="h-9 rounded-md border bg-background px-2 text-sm">
        <option value="user">User</option><option value="admin">Admin</option>
      </select>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{user.invited ? 'Invited' : 'Active'}</span>
        <button disabled={busy} onClick={() => void onDelete(user)} className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
      </div>
    </div>
  );
}
