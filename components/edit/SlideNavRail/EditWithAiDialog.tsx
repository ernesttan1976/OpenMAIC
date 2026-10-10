'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/hooks/use-i18n';
import type { Scene } from '@/lib/types/stage';

export function EditWithAiDialog({
  scene,
  instruction,
  pending,
  error,
  onInstructionChange,
  onClose,
  onSubmit,
}: {
  readonly scene: Scene | undefined;
  readonly instruction: string;
  readonly pending: boolean;
  readonly error: string;
  readonly onInstructionChange: (value: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
}) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = instruction.trim().length > 0 && !pending;

  useEffect(() => {
    if (scene) textareaRef.current?.focus();
  }, [scene?.id]);

  return (
    <Dialog
      open={Boolean(scene)}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        className="max-w-lg"
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('edit.nav.editWithAi')}</DialogTitle>
            <DialogDescription>
              {scene
                ? t('edit.nav.editWithAiDescription', {
                    order: scene.order,
                    title: scene.title,
                  })
                : t('edit.nav.editWithAiDescriptionFallback')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="slide-ai-edit-instruction" className="text-sm font-medium">
              {t('edit.nav.editInstruction')}
            </label>
            <textarea
              ref={textareaRef}
              id="slide-ai-edit-instruction"
              data-testid="slide-ai-edit-instruction"
              rows={5}
              required
              value={instruction}
              disabled={pending}
              onChange={(event) => onInstructionChange(event.target.value)}
              placeholder={t('edit.nav.editInstructionPlaceholder')}
              className="min-h-28 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              {t('edit.nav.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit} data-testid="slide-ai-edit-submit">
              {pending ? t('edit.nav.editSubmitting') : t('edit.nav.editSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
