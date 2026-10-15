import { randomUUID } from 'node:crypto';

import { getServerPersistenceProvider } from '@/lib/persistence/server-provider';
import type { AuthenticatedUser } from './session';
import { acceptPendingInvitations } from '@/lib/persistence/stage-collaborators';

interface UserRow extends Record<string, unknown> {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'admin' | 'user';
}

export function configuredAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: Pick<AuthenticatedUser, 'email' | 'role'>): boolean {
  return user.role === 'admin' || configuredAdminEmails().includes(user.email.toLowerCase());
}

export async function getAuthenticatedUser(userId: string, sessionId: string): Promise<AuthenticatedUser | null> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const result = await pool.query<UserRow>(`SELECT users.id, users.email, users.name, users.image, users.role FROM app_sessions sessions JOIN app_users users ON users.id = sessions.user_id WHERE sessions.id = $1 AND sessions.user_id = $2 AND sessions.expires_at > CURRENT_TIMESTAMP`, [sessionId, userId]);
  const row = result.rows[0];
  return row ? { id: row.id, email: row.email, name: row.name, image: row.image, role: row.role } : null;
}

export async function upsertGoogleUser(profile: { subject: string; email: string; name?: string; image?: string }): Promise<AuthenticatedUser> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const email = profile.email.trim().toLowerCase();
  const existingBySubject = await pool.query<UserRow>(
    'SELECT id, email, name, image, role FROM app_users WHERE google_subject = $1',
    [profile.subject],
  );
  let row = existingBySubject.rows[0];
  if (row) {
    const updated = await pool.query<UserRow>(
      `UPDATE app_users SET email = $2, name = $3, image = $4,
              email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 RETURNING id, email, name, image, role`,
      [row.id, email, profile.name ?? null, profile.image ?? null],
    );
    row = updated.rows[0]!;
  } else {
    const invited = await pool.query<UserRow>(
      'SELECT id, email, name, image, role FROM app_users WHERE email = $1',
      [email],
    );
    if (invited.rows[0]) {
      const updated = await pool.query<UserRow>(
        `UPDATE app_users SET google_subject = $2, name = $3, image = $4,
                email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND google_subject IS NULL
          RETURNING id, email, name, image, role`,
        [invited.rows[0].id, profile.subject, profile.name ?? null, profile.image ?? null],
      );
      row = updated.rows[0];
      if (!row) throw new Error('This email is already connected to another Google account');
    } else {
      const inserted = await pool.query<UserRow>(
        `INSERT INTO app_users (id, google_subject, email, name, image, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING id, email, name, image, role`,
        [randomUUID(), profile.subject, email, profile.name ?? null, profile.image ?? null],
      );
      row = inserted.rows[0]!;
    }
  }
  await acceptPendingInvitations(pool, row.id, row.email);
  return { id: row.id, email: row.email, name: row.name, image: row.image, role: row.role };
}

export async function createUserSession(userId: string, sessionId: string, expiresAt: number): Promise<void> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  await pool.query('INSERT INTO app_sessions (id, user_id, expires_at) VALUES ($1, $2, to_timestamp($3 / 1000.0))', [sessionId, userId, expiresAt]);
}

export async function revokeUserSession(sessionId: string): Promise<void> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  await pool.query('DELETE FROM app_sessions WHERE id = $1', [sessionId]);
}
