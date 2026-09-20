export function isAuthDebugEnabled(): boolean {
  return process.env.AUTH_DEBUG === 'true' || process.env.AUTH_DEBUG === '1';
}

export function authDebug(event: string, details: Record<string, unknown> = {}): void {
  if (isAuthDebugEnabled()) {
    console.info('[auth-debug]', event, details);
  }
}

export function authDebugError(
  event: string,
  error: unknown,
  details: Record<string, unknown> = {},
): void {
  if (isAuthDebugEnabled()) {
    console.error('[auth-debug]', event, {
      ...details,
      errorName: error instanceof Error ? error.name : typeof error,
    });
  }
}
