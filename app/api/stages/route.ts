/**
 * /api/stages — the workbench's course-document index and create face.
 *
 * The index contains only courses owned by or explicitly shared with the
 * signed-in account. Writes still
 * go through the owner-bound document store (`getOwnerScopedDocumentStore`),
 * the same seam the runner binds for the stage tools.
 *
 * The configured runtime gates the whole family: these routes serve the
 * workbench, which is agent-runtime territory, so a runtime that is off OR
 * enabled without a DATABASE_URL answers the same plain 404 as the agent
 * control-plane routes — never a 500 from a store that cannot connect.
 */
import type { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';

import { isAgentRuntimeConfigured } from '@/lib/config/feature-flags';
import type { AppDocumentOutline } from '@/lib/document-store/persistence-types';
import { apiError } from '@/lib/server/api-response';
import { getOwnerScopedDocumentStore } from '@/lib/server/agent-runtime/owner-scoped-documents';
import { ownerJson } from '@/lib/server/agent-runtime/route-response';
import { STAGE_NAME_MAX_LENGTH } from '@/lib/server/agent-runtime/stage-limits';
import { withRequestOwnerId } from '@/lib/server/agent-runtime/with-owner';
import { getStageAccessDb } from '@/lib/server/stage-access';

export const runtime = 'nodejs';

/** Mint a fresh, collision-free course id in the same `stage-` family as the agent tools. */
function createStageId(): string {
  return `stage-${randomBytes(9).toString('base64url')}`;
}

interface SharedStageRow extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  interactive_mode: boolean | null;
  task_engine_mode: boolean | null;
  created_at: number | string;
  updated_at: number | string;
  scene_count: number | string;
  folder_id: string | null;
  is_owner: boolean;
  role: 'owner' | 'editor' | 'viewer';
}

// GET /api/stages — list courses available to this account.
export async function GET(req: NextRequest) {
  if (!isAgentRuntimeConfigured()) return new Response('Not found', { status: 404 });

  return withRequestOwnerId(req, async (ownerId, responseHeaders) => {
    const db = await getStageAccessDb();
    const result = await db.query<SharedStageRow>(
      `SELECT stages.id,
              stages.name,
              stages.description,
              stages.interactive_mode,
              stages.task_engine_mode,
              stages.created_at,
              stages.updated_at,
              CASE WHEN meta.owner_id = $1 THEN stages.folder_id ELSE NULL END AS folder_id,
              COUNT(scenes.id)::text AS scene_count,
              (meta.owner_id = $1) AS is_owner,
              CASE WHEN meta.owner_id = $1 THEN 'owner' ELSE collaborators.role END AS role
         FROM stage_meta AS meta
          JOIN document_stages AS stages ON stages.id = meta.stage_id
          LEFT JOIN stage_collaborators AS collaborators
            ON collaborators.stage_id = meta.stage_id AND collaborators.user_id = $1
          LEFT JOIN document_scenes AS scenes ON scenes.stage_id = stages.id
         WHERE meta.deleted_at IS NULL AND (meta.owner_id = $1 OR collaborators.user_id IS NOT NULL)
         GROUP BY stages.id, meta.owner_id, collaborators.role
        ORDER BY stages.updated_at DESC, stages.id ASC`,
      [ownerId],
    );
    const stages = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ...(row.description === null ? {} : { description: row.description }),
      ...(row.interactive_mode === null ? {} : { interactiveMode: row.interactive_mode }),
      ...(row.task_engine_mode === null ? {} : { taskEngineMode: row.task_engine_mode }),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
      sceneCount: Number(row.scene_count),
       ...(row.folder_id === null ? {} : { folderId: row.folder_id }),
       isOwner: row.is_owner === true,
       role: row.role,
       canEdit: row.role === 'owner' || row.role === 'editor',
    }));
    return ownerJson({ stages }, 200, responseHeaders);
  });
}

// POST /api/stages — create a stage document shell { name, description? }.
//
// Validation happens before owner resolution, like the agent session routes:
// a malformed body must not mint an anonymous cookie partition for a request
// that will not proceed.
export async function POST(req: NextRequest) {
  if (!isAgentRuntimeConfigured()) return new Response('Not found', { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('INVALID_REQUEST', 400, 'invalid JSON body');
  }
  if (typeof body !== 'object' || body === null) {
    return apiError('INVALID_REQUEST', 400, 'request body must be a JSON object');
  }
  const { name, description } = body as { name?: unknown; description?: unknown };
  if (typeof name !== 'string' || name.trim().length === 0) {
    return apiError('MISSING_REQUIRED_FIELD', 400, 'name is required');
  }
  const trimmedName = name.trim();
  if (trimmedName.length > STAGE_NAME_MAX_LENGTH) {
    return apiError(
      'INVALID_REQUEST',
      400,
      `name exceeds the ${STAGE_NAME_MAX_LENGTH} character limit`,
    );
  }
  if (description !== undefined && typeof description !== 'string') {
    return apiError('INVALID_REQUEST', 400, 'description must be a string when present');
  }
  const trimmedDescription = description?.trim();

  return withRequestOwnerId(req, async (ownerId, responseHeaders) => {
    const id = createStageId();
    const now = Date.now();
    const outline: AppDocumentOutline = {
      outlines: [],
      requirement: trimmedName,
      generationComplete: false,
      createdAt: now,
      updatedAt: now,
    };
    const store = await getOwnerScopedDocumentStore(ownerId);
    await store.saveDocument({
      stage: {
        id,
        name: trimmedName,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        createdAt: now,
        updatedAt: now,
      },
      scenes: [],
      outline,
    });
    return ownerJson(
      {
        stage: {
          id,
          name: trimmedName,
          ...(trimmedDescription ? { description: trimmedDescription } : {}),
          createdAt: now,
          updatedAt: now,
          sceneCount: 0,
        },
      },
      201,
      responseHeaders,
    );
  });
}
