import { describe, expect, it, vi } from 'vitest';
import { decideDocumentAccess, parseDocumentAction } from '@/lib/persistence/document-access';

const liveStage = { stageId: 'stage-1', ownerId: 'owner-1', isPublic: false, publishedAt: null, generationComplete: false, deletedAt: null };

function accessFor(role: 'owner' | 'editor' | 'viewer' | 'none', admin = false) {
  const readMeta = vi.fn(async () => liveStage);
  const exists = vi.fn(async () => true);
  const readRole = vi.fn(async () => role);
  return { decide: (action: ReturnType<typeof parseDocumentAction>) => decideDocumentAccess(action, 'member-1', readMeta, exists, readMeta, readRole, admin) };
}

describe('course document permissions', () => {
  it('allows a shared user to read but not edit, regardless of legacy editor role', async () => {
    const viewer = accessFor('viewer');
    expect(await viewer.decide(parseDocumentAction('GET', '/documents/stage-1'))).toBe('allow');
    expect(await viewer.decide(parseDocumentAction('PUT', '/documents/stage-1/stage'))).toBe('forbid');

    const legacyEditor = accessFor('editor');
    expect(await legacyEditor.decide(parseDocumentAction('GET', '/documents/stage-1'))).toBe('allow');
    expect(await legacyEditor.decide(parseDocumentAction('PUT', '/documents/stage-1/stage'))).toBe('forbid');
  });

  it('allows administrators to read and edit courses outside their ownership', async () => {
    const admin = accessFor('none', true);
    expect(await admin.decide(parseDocumentAction('GET', '/documents/stage-1'))).toBe('allow');
    expect(await admin.decide(parseDocumentAction('PUT', '/documents/stage-1/stage'))).toBe('allow');
  });

  it('keeps course deletion owner-only', async () => {
    const admin = accessFor('none', true);
    expect(await admin.decide(parseDocumentAction('DELETE', '/documents/stage-1'))).toBe('forbid');
  });
});
