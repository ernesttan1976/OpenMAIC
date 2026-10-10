'use client';

/** The editor delegates sends to the mounted workbench chat's ordinary path. */
export type EditorWorkbenchSubmit = (text: string) => Promise<boolean>;

let activeSubmit: EditorWorkbenchSubmit | null = null;

export function registerEditorWorkbenchSubmit(submit: EditorWorkbenchSubmit): () => void {
  activeSubmit = submit;
  return () => {
    if (activeSubmit === submit) activeSubmit = null;
  };
}

export async function submitFromEditor(text: string): Promise<boolean | null> {
  return activeSubmit ? activeSubmit(text) : null;
}

const PENDING_EDITOR_MESSAGE_KEY = 'openmaic:workbench:pending-editor-message';

export function queueEditorMessageForWorkspace(text: string): void {
  try {
    window.sessionStorage.setItem(PENDING_EDITOR_MESSAGE_KEY, text);
  } catch {
    // Private browsing may disable sessionStorage; the route still opens and
    // the user can submit the same instruction from the workbench composer.
  }
}

export function takeQueuedEditorMessage(): string | null {
  try {
    const text = window.sessionStorage.getItem(PENDING_EDITOR_MESSAGE_KEY);
    if (text) window.sessionStorage.removeItem(PENDING_EDITOR_MESSAGE_KEY);
    return text;
  } catch {
    return null;
  }
}
