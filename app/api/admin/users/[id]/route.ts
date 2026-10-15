import { configuredAdminEmails } from '@/lib/auth/users';
import { getAdminRequestUser } from '@/lib/auth/admin';
import { getServerPersistenceProvider } from '@/lib/persistence/server-provider';

export const runtime = 'nodejs';
type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await getAdminRequestUser(request);
  if (!admin) return Response.json({ error: 'Admin access required' }, { status: 403 });
  const { id } = await params;
  let body: { name?: unknown; role?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const name = typeof body.name === 'string' ? body.name.trim() : null;
  const role = body.role === 'admin' || body.role === 'user' ? body.role : null;
  if (name === null || name.length > 120 || !role) {
    return Response.json({ error: 'A name (up to 120 characters) and valid role are required' }, { status: 400 });
  }
  if (id === admin.id && role !== 'admin') {
    return Response.json({ error: 'You cannot remove your own administrator access' }, { status: 409 });
  }

  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const updated = await pool.query<{ id: string; email: string; name: string | null; role: 'admin' | 'user' } & Record<string, unknown>>(
    `UPDATE app_users
        SET name = NULLIF($2, ''),
            role = CASE WHEN lower(email) = ANY($4::text[]) THEN 'admin' ELSE $3 END,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING id, email, name, role`,
    [id, name, role, configuredAdminEmails()],
  );
  const user = updated.rows[0];
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  return Response.json({ user });
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = await getAdminRequestUser(request);
  if (!admin) return Response.json({ error: 'Admin access required' }, { status: 403 });
  const { id } = await params;
  if (id === admin.id) return Response.json({ error: 'You cannot delete your own account' }, { status: 409 });

  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const userResult = await pool.query<{ email: string; role: 'admin' | 'user' } & Record<string, unknown>>(
    'SELECT email, role FROM app_users WHERE id = $1', [id],
  );
  const user = userResult.rows[0];
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  if (configuredAdminEmails().includes(user.email.toLowerCase())) {
    return Response.json({ error: 'Configured administrator accounts cannot be deleted' }, { status: 409 });
  }
  if (user.role === 'admin') {
    const admins = await pool.query<{ count: string } & Record<string, unknown>>(
      `SELECT count(*)::text AS count FROM app_users WHERE role = 'admin' OR lower(email) = ANY($1::text[])`,
      [configuredAdminEmails()],
    );
    if (Number(admins.rows[0]?.count ?? 0) <= 1) {
      return Response.json({ error: 'The last administrator cannot be deleted' }, { status: 409 });
    }
  }
  const owned = await pool.query<{ count: string } & Record<string, unknown>>(
    'SELECT count(*)::text AS count FROM stage_meta WHERE owner_id = $1 AND deleted_at IS NULL', [id],
  );
  if (Number(owned.rows[0]?.count ?? 0) > 0) {
    return Response.json({ error: 'Transfer or delete this user’s courses before deleting the account' }, { status: 409 });
  }
  await pool.query('DELETE FROM app_users WHERE id = $1', [id]);
  return Response.json({ ok: true });
}
