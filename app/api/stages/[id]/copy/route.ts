import { randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';

import { isAgentRuntimeConfigured } from '@/lib/config/feature-flags';
import { isAdminUser } from '@/lib/auth/users';
import { getOwnerScopedDocumentStore } from '@/lib/server/agent-runtime/owner-scoped-documents';
import { ownerJson, ownerNotFound } from '@/lib/server/agent-runtime/route-response';
import { withRequestOwnerId } from '@/lib/server/agent-runtime/with-owner';
import { resolveStageAccess } from '@/lib/server/stage-access';
import { getStageAccessDb } from '@/lib/server/stage-access';

export const runtime = 'nodejs';
type Params = { params: Promise<{ id: string }> };

function copyStageId(): string {
  return `stage-${randomBytes(9).toString('base64url')}`;
}

export async function POST(request: NextRequest, { params }: Params) {
  if (!isAgentRuntimeConfigured()) return new Response('Not found', { status: 404 });
  return withRequestOwnerId(request, async (ownerId, responseHeaders, user) => {
    if (!isAdminUser(user)) return ownerNotFound(responseHeaders);
    const { id } = await params;
    const access = await resolveStageAccess(id, await getStageAccessDb());
    if (!access) return ownerNotFound(responseHeaders);
    const sourceStore = await getOwnerScopedDocumentStore(access.ownerId);
    const source = await sourceStore.loadDocument(id);
    if (!source) return ownerNotFound(responseHeaders);

    const newId = copyStageId();
    const now = Date.now();
    const targetStore = await getOwnerScopedDocumentStore(ownerId);
    await targetStore.saveDocument({
      ...source,
      stage: {
        ...source.stage,
        id: newId,
        name: `${source.stage.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      },
      scenes: source.scenes.map((scene) => ({ ...scene, stageId: newId })),
    });
    return ownerJson({ id: newId, name: `${source.stage.name} (Copy)` }, 201, responseHeaders);
  });
}
