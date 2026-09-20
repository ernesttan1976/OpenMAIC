'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface HeaderActionPortalProps {
  readonly children: ReactNode;
  readonly fallbackClassName: string;
}

/** Places global classroom actions in the stage header when it is mounted. */
export function HeaderActionPortal({ children, fallbackClassName }: HeaderActionPortalProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findTarget = () => setTarget(document.getElementById('header-account-actions'));
    findTarget();

    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (target) return createPortal(children, target);

  return <div className={fallbackClassName}>{children}</div>;
}
