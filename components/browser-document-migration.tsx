'use client';

import { useEffect } from 'react';

import { BrowserDocumentStore } from '@openmaic/storage';

import {
  migrateBrowserDocuments,
  validateAppScene,
  validateAppStage,
} from '@/lib/document-store';
import type { AppStage } from '@/lib/document-store';
import { createLogger } from '@/lib/logger';
import { isBrowserPersistenceEnabled } from '@/lib/persistence/bootstrap';
import type { AppScene } from '@/lib/types/stage';

const log = createLogger('BrowserDocumentMigration');

/** Copies local classrooms to the signed-in account's server store after enabling persistence. */
export function BrowserDocumentMigration() {
  useEffect(() => {
    if (!isBrowserPersistenceEnabled()) return;
    const sourceStore = new BrowserDocumentStore<AppScene, AppStage>({
      validateScene: validateAppScene,
      validateStage: validateAppStage,
    });
    void migrateBrowserDocuments({ sourceStore }).then((result) => {
      if (result.failedStageIds.length > 0) {
        log.warn('Some local classrooms could not be migrated', result);
      }
    });
  }, []);
  return null;
}
