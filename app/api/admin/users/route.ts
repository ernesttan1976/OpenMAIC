import { randomUUID } from 'node:crypto';

import { configuredAdminEmails } from '@/lib/auth/users';
import { getAdminRequestUser } from '@/lib/auth/admin';
import { getServerPersistenceProvider } from '@/lib/persistence/server-provider';

export const runtime = 'nodejs';

interface UserRow extends Record<string, unknown> {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  google_subject: string | null;
  created_at: Date | string;
}

export async function GET(request: Request) {
  const admin = await getAdminRequestUser(request);
  if (!admin) return Response.json({ error: 'Admin access required' }, { status: 403 });

  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const rows = await pool.query<UserRow>(
    `SELECT id, email, name,
            CASE WHEN lower(email) = ANY($1::text[]) THEN 'admin' ELSE role END AS role,
            google_subject, created_at
       FROM app_users ORDER BY lower(email), id`,
    [configuredAdminEmails()],
  );
  return Response.json({ users: rows.rows.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    invited: user.google_subject === null,
    createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
  })) });
}

export async function POST(request: Request) {
  const admin = await getAdminRequestUser(request);
  if (!admin) return Response.json({ error: 'Admin access required' }, { status: 403 });

  let body: { email?: unknown; name?: unknown; role?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const role = body.role === 'admin' ? 'admin' : body.role === 'user' ? 'user' : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role || name.length > 120) {
    return Response.json({ error: 'A valid email, name (up to 120 characters), and role are required' }, { status: 400 });
  }

  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const created = await pool.query<UserRow>(
    `INSERT INTO app_users (id, google_subject, email, name, image, email_verified_at, role)
     VALUES ($1, NULL, $2, NULLIF($3, ''), NULL, NULL, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, name, role, google_subject, created_at`,
    [randomUUID(), email, name, role],
  );
  const row = created.rows[0];
  if (!row) return Response.json({ error: 'A user with this email already exists' }, { status: 409 });
  return Response.json({ user: { id: row.id, email: row.email, name: row.name, role: row.role, invited: true } }, { status: 201 });
}
