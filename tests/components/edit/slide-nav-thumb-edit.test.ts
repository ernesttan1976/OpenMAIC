// @vitest-environment jsdom

import {
  act,
  createElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Scene } from '@/lib/types/stage';

const mocks = vi.hoisted(() => ({ updateScene: vi.fn() }));

vi.mock('motion/react', () => ({
  Reorder: {
    Item: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) =>
      createElement('li', props, children),
  },
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => createElement('div', null, children),
  DropdownMenuContent: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
    createElement('div', props, children),
  DropdownMenuItem: ({
    children,
    onSelect,
    ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & {
    onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  }) => createElement('button', { ...props, onClick: onSelect }, children),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components/stage/scene-thumbnail-content', () => ({
  SceneThumbnailContent: () => createElement('span', null, 'thumbnail'),
}));
vi.mock('@/lib/edit/scene-creation-enabled', () => ({ SCENE_CREATION_ENABLED: false }));
vi.mock('@/lib/edit/content-validation', () => ({ sceneHasIssues: () => false }));
vi.mock('@/lib/hooks/use-near-viewport', () => ({ useNearViewport: () => true }));
vi.mock('@/lib/store/canvas', () => ({
  useCanvasStore: { use: { viewportSize: () => 1000, viewportRatio: () => 0.5625 } },
}));
vi.mock('@/lib/store/stage', () => ({
  useStageStore: { use: { updateScene: () => mocks.updateScene } },
}));
vi.mock('@/lib/hooks/use-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const { ThumbItem } = await import('@/components/edit/SlideNavRail/ThumbItem');

function scene(type: Scene['type']): Scene {
  return {
    id: 'scene-1',
    stageId: 'stage-1',
    order: 1,
    title: 'First slide',
    type,
    content:
      type === 'slide'
        ? { type: 'slide', canvas: { id: 'canvas-1', viewportSize: 1000, viewportRatio: 0.5625, theme: {}, elements: [] } }
        : ({ type } as never),
    actions: [],
  } as Scene;
}

describe('slide thumbnail AI edit action', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('offers the edit action for slides and invokes it without activating the thumbnail', async () => {
    const onEditWithAi = vi.fn();
    const onActivate = vi.fn();
    await act(async () => {
      root.render(
        createElement(ThumbItem, {
          scene: scene('slide'),
          index: 0,
          active: false,
          canDelete: true,
          onActivate,
          onDuplicate: vi.fn(),
          onDelete: vi.fn(),
          onEditWithAi,
        }),
      );
    });

    const action = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('edit.nav.editWithAi'),
    );
    expect(action).toBeTruthy();
    await act(async () => action!.click());

    expect(onEditWithAi).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not offer the edit action for non-slide scenes', async () => {
    await act(async () => {
      root.render(
        createElement(ThumbItem, {
          scene: scene('quiz'),
          index: 0,
          active: false,
          canDelete: true,
          onActivate: vi.fn(),
          onDuplicate: vi.fn(),
          onDelete: vi.fn(),
          onEditWithAi: vi.fn(),
        }),
      );
    });

    expect(container.textContent).not.toContain('edit.nav.editWithAi');
  });
});
