import { randomUUID } from 'node:crypto';

import { getServerPersistenceProvider } from '@/lib/persistence/server-provider';
import type { AuthenticatedUser } from './session';
import { acceptPendingInvitations } from '@/lib/persistence/stage-collaborators';

interface UserRow extends Record<string, unknown> { id: string; email: string; name: string | null; image: string | null }

export async function getAuthenticatedUser(userId: string, sessionId: string): Promise<AuthenticatedUser | null> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const result = await pool.query<UserRow>(`SELECT users.id, users.email, users.name, users.image FROM app_sessions sessions JOIN app_users users ON users.id = sessions.user_id WHERE sessions.id = $1 AND sessions.user_id = $2 AND sessions.expires_at > CURRENT_TIMESTAMP`, [sessionId, userId]);
  const row = result.rows[0];
  return row ? { id: row.id, email: row.email, name: row.name, image: row.image } : null;
}

export async function upsertGoogleUser(profile: { subject: string; email: string; name?: string; image?: string }): Promise<AuthenticatedUser> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  const result = await pool.query<UserRow>(`INSERT INTO app_users (id, google_subject, email, name, image, email_verified_at) VALUES ($1, $2, lower($3), $4, $5, CURRENT_TIMESTAMP) ON CONFLICT (google_subject) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, image = EXCLUDED.image, email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP RETURNING id, email, name, image`, [randomUUID(), profile.subject, profile.email, profile.name ?? null, profile.image ?? null]);
  const row = result.rows[0]!;
  await acceptPendingInvitations(pool, row.id, row.email);
  return { id: row.id, email: row.email, name: row.name, image: row.image };
}

export async function createUserSession(userId: string, sessionId: string, expiresAt: number): Promise<void> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  await pool.query('INSERT INTO app_sessions (id, user_id, expires_at) VALUES ($1, $2, to_timestamp($3 / 1000.0))', [sessionId, userId, expiresAt]);
}

export async function revokeUserSession(sessionId: string): Promise<void> {
  const { pool } = await getServerPersistenceProvider(process.env.DATABASE_URL ?? '');
  await pool.query('DELETE FROM app_sessions WHERE id = $1', [sessionId]);
}
