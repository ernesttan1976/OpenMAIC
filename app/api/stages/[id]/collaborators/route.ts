import type { NextRequest } from 'next/server';

import { getStageAccessDb } from '@/lib/server/stage-access';
import { withRequestOwnerId } from '@/lib/server/agent-runtime/with-owner';
import { stageRole } from '@/lib/persistence/stage-collaborators';

export const runtime = 'nodejs';
type Params = { params: Promise<{ id: string }> };

async function requireOwner(stageId: string, userId: string) {
  const db = await getStageAccessDb();
  return (await stageRole(db, stageId, userId)) === 'owner' ? db : null;
}

export async function GET(req: NextRequest, { params }: Params) {
  return withRequestOwnerId(req, async (userId) => {
    const { id } = await params;
    const db = await requireOwner(id, userId);
    if (!db) return Response.json({ error: 'Not found' }, { status: 404 });
    const result = await db.query<{ email: string | null; role: string; accepted_at: Date | null } & Record<string, unknown>>(
      `SELECT coalesce(users.email, collaborators.invite_email) AS email, collaborators.role, collaborators.accepted_at
         FROM stage_collaborators collaborators LEFT JOIN app_users users ON users.id = collaborators.user_id
        WHERE collaborators.stage_id = $1 ORDER BY email`, [id]);
    return Response.json({ collaborators: result.rows.map((row) => ({ email: row.email, role: row.role, accepted: row.accepted_at !== null })) });
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  let body: { email?: unknown; role?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = body.role === 'editor' || body.role === 'viewer' ? body.role : null;
  if (!email || !role) return Response.json({ error: 'email and a viewer/editor role are required' }, { status: 400 });
  return withRequestOwnerId(req, async (userId) => {
    const { id } = await params;
    const db = await requireOwner(id, userId);
    if (!db) return Response.json({ error: 'Not found' }, { status: 404 });
    await db.query(
      `INSERT INTO stage_collaborators (stage_id, user_id, invite_email, role, invited_by, accepted_at)
       VALUES ($1, (SELECT id FROM app_users WHERE email = $2), $2, $3, $4,
               CASE WHEN EXISTS (SELECT 1 FROM app_users WHERE email = $2) THEN CURRENT_TIMESTAMP END)
       ON CONFLICT (stage_id, invite_email) DO UPDATE SET role = EXCLUDED.role, invited_by = EXCLUDED.invited_by,
         user_id = coalesce(stage_collaborators.user_id, EXCLUDED.user_id), accepted_at = coalesce(stage_collaborators.accepted_at, EXCLUDED.accepted_at)`,
      [id, email, role, userId],
    );
    return Response.json({ ok: true }, { status: 201 });
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const email = new URL(req.url).searchParams.get('email')?.trim().toLowerCase();
  if (!email) return Response.json({ error: 'email is required' }, { status: 400 });
  return withRequestOwnerId(req, async (userId) => {
    const { id } = await params;
    const db = await requireOwner(id, userId);
    if (!db) return Response.json({ error: 'Not found' }, { status: 404 });
    await db.query(`DELETE FROM stage_collaborators WHERE stage_id = $1 AND invite_email = $2`, [id, email]);
    return Response.json({ ok: true });
  });
}
