'use client';

import { useState } from 'react';
import { HeaderActionPortal } from '@/components/header-action-portal';

export function CollaboratorManager({ stageId }: { stageId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [message, setMessage] = useState('');

  async function invite() {
    setMessage('');
    const response = await fetch(`/api/stages/${encodeURIComponent(stageId)}/collaborators`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) {
      setMessage('Only the classroom owner can manage collaborators.');
      return;
    }
    setEmail('');
    setMessage('Invitation saved. It activates when the Google account signs in.');
  }

  return (
    <HeaderActionPortal fallbackClassName="fixed right-4 top-4 z-50">
      <div className="order-1 relative">
        <button
          className="rounded-md bg-background/90 px-3 py-2 text-sm shadow"
          onClick={() => setOpen(!open)}
        >
          Share
        </button>
        {open && (
          <form
            className="absolute right-0 top-full mt-2 w-80 rounded-md bg-background p-3 shadow-lg"
            onSubmit={(event) => {
              event.preventDefault();
              void invite();
            }}
          >
            <label className="mb-1 block text-sm font-medium" htmlFor="collaborator-email">
              Google email
            </label>
            <input
              id="collaborator-email"
              className="mb-2 w-full rounded border p-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <select
              className="mb-2 w-full rounded border p-2"
              value={role}
              onChange={(event) => setRole(event.target.value as 'viewer' | 'editor')}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">
              Invite
            </button>
            {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
          </form>
        )}
      </div>
    </HeaderActionPortal>
  );
}
