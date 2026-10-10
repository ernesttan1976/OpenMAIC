// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  queueEditorMessageForWorkspace,
  registerEditorWorkbenchSubmit,
  submitFromEditor,
  takeQueuedEditorMessage,
} from '@/lib/workbench/editor-submit-bridge';

describe('editor/workbench message bridge', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('delegates to the registered workbench submit handler and unregisters it', async () => {
    const submit = vi.fn(async () => true);
    const unregister = registerEditorWorkbenchSubmit(submit);

    await expect(submitFromEditor('edit this slide')).resolves.toBe(true);
    expect(submit).toHaveBeenCalledWith('edit this slide');

    unregister();
    await expect(submitFromEditor('no active chat')).resolves.toBeNull();
  });

  it('keeps a standalone-editor message for workspace chat to consume once', () => {
    queueEditorMessageForWorkspace('edit only scene-1');

    expect(takeQueuedEditorMessage()).toBe('edit only scene-1');
    expect(takeQueuedEditorMessage()).toBeNull();
  });
});
