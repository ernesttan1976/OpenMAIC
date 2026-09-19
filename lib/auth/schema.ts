import type { Queryable } from '@openmaic/storage/document/pg';

const AUTH_SCHEMA = `
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  google_subject TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  email_verified_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON app_sessions (user_id);
CREATE INDEX IF NOT EXISTS app_sessions_expiry_idx ON app_sessions (expires_at);
`;

export async function ensureAuthSchema(queryable: Queryable): Promise<void> {
  for (const statement of AUTH_SCHEMA.split(';')) if (statement.trim()) await queryable.query(statement);
}
