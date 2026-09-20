'use client';

import { useEffect } from 'react';

export function AuthDebug() {
  useEffect(() => {
    console.info('[auth-debug]', 'authenticated page loaded', { path: window.location.pathname });
    fetch('/api/auth/debug')
      .then(async (response) => ({
        response,
        data: (await response.json()) as { authenticated?: boolean },
      }))
      .then(({ response, data }) => {
        console.info('[auth-debug]', 'server session check completed', {
          authenticated: data.authenticated === true,
          status: response.status,
        });
      })
      .catch((error: unknown) => {
        console.error('[auth-debug]', 'server session check failed', {
          errorName: error instanceof Error ? error.name : typeof error,
        });
      });
  }, []);

  return null;
}
