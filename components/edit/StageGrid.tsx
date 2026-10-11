import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './StageGrid.module.css';

export type MobileEditorPanel = 'slides' | 'timeline' | null;

interface StageGridProps {
  /** Top bar — auto-height row spanning the full width (e.g. CommandBar). */
  readonly topSlot?: ReactNode;
  /** Left column — auto-width (e.g. SlideNavRail). */
  readonly leftSlot?: ReactNode;
  /** Right column — auto-width (future: properties panel, AI hints). */
  readonly rightSlot?: ReactNode;
  /** Bottom bar — auto-height row spanning the full width (future: timeline). */
  readonly bottomSlot?: ReactNode;
  /** Center cell — fills remaining space, hosts the scene canvas. */
  readonly centerSlot: ReactNode;
  readonly className?: string;
  readonly mobilePanel?: MobileEditorPanel;
}

/**
 * Edit-mode chrome layout shell with five named slots
 * (top / left / right / bottom / center). Optional slots collapse to
 * zero width / height when not provided, so adding a right or bottom
 * panel later is a drop-in prop — no restructure of the existing edit
 * tree. The center slot is mandatory and gets `minWidth: 0` /
 * `minHeight: 0` so its children can shrink correctly (the usual
 * "flex / grid item won't shrink below content" trap).
 *
 *   ┌──────────┬─────────────────────┬─────────────┐
 *   │          │       topSlot                     │
 *   │ leftSlot ├─────────────────────┬─────────────┤
 *   │          │       centerSlot    │  rightSlot  │
 *   │ (full    ├─────────────────────┴─────────────┤
 *   │  height) │       bottomSlot                  │
 *   └──────────┴────────────────────────────────────┘
 *
 * The left slot spans all three rows so a sidebar always renders at
 * the absolute left edge of the chrome — matches the playback
 * `SceneSidebar` shape exactly so mode swaps don't shift the
 * sidebar/header pixel positions and the user's click targets stay
 * anchored.
 *
 * Inline `gridTemplateAreas` is used instead of Tailwind utility
 * classes because Tailwind can't statically generate dynamic named
 * areas; the grid template is a literal shape, not a state-dependent
 * one, so the inline style is stable.
 */
const GRID_STYLE: CSSProperties = {
  display: 'grid',
  // bottom spans the center column only; `right` spans rows 2–3 so the
  // right rail (AI sidebar) stays full-height while the bottom bar (actions
  // timeline) sits under the canvas.
  gridTemplateAreas: `"left top top" "left center right" "left bottom right"`,
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
};

export function StageGrid({
  topSlot,
  leftSlot,
  rightSlot,
  bottomSlot,
  centerSlot,
  className,
  mobilePanel = null,
}: StageGridProps) {
  return (
    <div
      className={cn('h-full w-full', styles.stageGrid, className)}
      style={GRID_STYLE}
      data-mobile-panel={mobilePanel ?? 'closed'}
    >
      {topSlot ? (
        <div className={styles.top} style={{ gridArea: 'top' }}>
          {topSlot}
        </div>
      ) : null}
      {leftSlot ? (
        <div className={styles.left} style={{ gridArea: 'left' }}>
          {leftSlot}
        </div>
      ) : null}
      <div
        className={styles.center}
        style={{ gridArea: 'center', minHeight: 0, minWidth: 0, position: 'relative' }}
      >
        {centerSlot}
      </div>
      {rightSlot ? <div style={{ gridArea: 'right' }}>{rightSlot}</div> : null}
      {bottomSlot ? (
        <div className={styles.bottom} style={{ gridArea: 'bottom' }}>
          {bottomSlot}
        </div>
      ) : null}
    </div>
  );
}
