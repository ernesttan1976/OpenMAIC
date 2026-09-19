import type { Queryable } from '@openmaic/storage/document/pg';

export type StageRole = 'owner' | 'editor' | 'viewer' | 'none';

export const STAGE_COLLABORATOR_SCHEMA = `
CREATE TABLE IF NOT EXISTS stage_collaborators (
  stage_id TEXT NOT NULL REFERENCES stage_meta(stage_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
  invite_email TEXT,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invited_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMPTZ,
  CHECK (user_id IS NOT NULL OR invite_email IS NOT NULL),
  PRIMARY KEY (stage_id, invite_email)
);
CREATE UNIQUE INDEX IF NOT EXISTS stage_collaborators_user_idx
  ON stage_collaborators (stage_id, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stage_collaborators_invite_idx
  ON stage_collaborators (invite_email) WHERE invite_email IS NOT NULL;
`;

export async function ensureStageCollaboratorSchema(queryable: Queryable): Promise<void> {
  for (const statement of STAGE_COLLABORATOR_SCHEMA.split(';')) if (statement.trim()) await queryable.query(statement);
}

export async function stageRole(queryable: Queryable, stageId: string, userId: string): Promise<StageRole> {
  const result = await queryable.query<{ owner_id: string; role: string | null } & Record<string, unknown>>(
    `SELECT meta.owner_id, collaborators.role
       FROM stage_meta meta
       LEFT JOIN stage_collaborators collaborators ON collaborators.stage_id = meta.stage_id AND collaborators.user_id = $2
      WHERE meta.stage_id = $1 AND meta.deleted_at IS NULL`,
    [stageId, userId],
  );
  const row = result.rows[0];
  if (!row) return 'none';
  if (row.owner_id === userId) return 'owner';
  return row.role === 'editor' || row.role === 'viewer' ? row.role : 'none';
}

export async function acceptPendingInvitations(queryable: Queryable, userId: string, email: string): Promise<void> {
  await queryable.query(
    `UPDATE stage_collaborators SET user_id = $1, accepted_at = CURRENT_TIMESTAMP
      WHERE invite_email = lower($2) AND user_id IS NULL`,
    [userId, email],
  );
}
