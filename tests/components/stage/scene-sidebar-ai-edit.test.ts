// @vitest-environment jsdom

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Scene } from '@/lib/types/stage';

const mocks = vi.hoisted(() => ({
  scenes: [] as Scene[],
  setCurrentSceneId: vi.fn(),
  stage: { id: 'stage-1' },
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/slide-renderer/SlideThumbnail', () => ({
  SlideThumbnail: () => createElement('div', null, 'thumbnail'),
}));
vi.mock('@/components/slide-renderer/components/ThumbnailInteractive', () => ({
  ThumbnailInteractive: () => createElement('div'),
}));
vi.mock('@/components/ui/switch', () => ({ Switch: () => createElement('button') }));
vi.mock('@/components/edit/SlideNavRail/EditWithAiDialog', () => ({
  EditWithAiDialog: ({ scene }: { scene?: Scene }) =>
    scene
      ? createElement('div', { 'data-testid': 'ai-edit-dialog', 'data-scene-id': scene.id })
      : null,
}));
vi.mock('@/lib/store', () => {
  const useStageStore = Object.assign(
    () => ({
      scenes: mocks.scenes,
      currentSceneId: mocks.scenes[0]?.id,
      setCurrentSceneId: mocks.setCurrentSceneId,
      generatingOutlines: [],
      generationStatus: 'idle',
    }),
    { use: { stage: () => mocks.stage, failedOutlines: () => [] } },
  );
  return {
    useStageStore,
    useCanvasStore: { use: { viewportSize: () => 1000, viewportRatio: () => 0.5625 } },
  };
});
vi.mock('@/lib/hooks/use-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/lib/hooks/use-near-viewport', () => ({ useNearViewport: () => true }));
vi.mock('@/lib/workbench/panel-context', () => ({ useInWorkbenchPanel: () => false }));
vi.mock('@/lib/workbench/editor-submit-bridge', () => ({
  queueEditorMessageForWorkspace: vi.fn(),
  submitFromEditor: vi.fn(),
}));

const { SceneSidebar } = await import('@/components/stage/scene-sidebar');

function scene(type: Scene['type']): Scene {
  return {
    id: 'scene-1',
    stageId: 'stage-1',
    order: 1,
    title: 'First page',
    type,
    content:
      type === 'slide'
        ? {
            type: 'slide',
            canvas: {
              id: 'canvas-1',
              viewportSize: 1000,
              viewportRatio: 0.5625,
              theme: {},
              elements: [],
            },
          }
        : ({ type } as never),
    actions: [],
  } as Scene;
}

describe('classroom scene sidebar AI edit action', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mocks.scenes = [scene('slide')];
    mocks.setCurrentSceneId.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('opens the selected slide AI edit dialog without selecting the scene again', async () => {
    const onSceneSelect = vi.fn();
    await act(async () => {
      root.render(
        createElement(SceneSidebar, {
          collapsed: false,
          onCollapseChange: vi.fn(),
          onSceneSelect,
        }),
      );
    });

    const action = container.querySelector<HTMLButtonElement>(
      '[data-testid="scene-edit-with-ai"]',
    );
    expect(action).not.toBeNull();
    await act(async () => action?.click());

    expect(
      container.querySelector('[data-testid="ai-edit-dialog"]')?.getAttribute('data-scene-id'),
    ).toBe('scene-1');
    expect(onSceneSelect).not.toHaveBeenCalled();
    expect(mocks.setCurrentSceneId).not.toHaveBeenCalled();
  });

  it('only offers AI editing for slide scenes', async () => {
    mocks.scenes = [scene('quiz')];
    await act(async () => {
      root.render(
        createElement(SceneSidebar, {
          collapsed: false,
          onCollapseChange: vi.fn(),
        }),
      );
    });

    expect(container.querySelector('[data-testid="scene-edit-with-ai"]')).toBeNull();
  });
});
