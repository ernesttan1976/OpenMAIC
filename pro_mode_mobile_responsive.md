# Pro Mode Mobile Responsiveness Plan

## Goal

Make the Pro workspace usable on phones and tablets, with particular attention to medium-width devices in both portrait and landscape. Preserve the three-pane workspace model and its URL/session behavior while making navigation, conversation, classroom content, and the home composer fit the available viewport without clipped controls or accidental horizontal scrolling.

This document is a plan for a focused responsive pass; it does not claim that the workspace is already fully responsive.

## Current implementation and constraints

- Pro mode is the `/workspace` route. The classic homepage remains the default: its Pro switch is rendered unchecked and only appears when both the public workbench build flag and the runtime probe enable the entry.
- `WorkspaceShell` owns the full-viewport layout (`100dvh`) and keeps pane selection in the URL. Its navigation rail is hidden below Tailwind `md` (768px); the compact rail begins at 768px.
- Conversation and classroom are mutually exclusive below 1024px (`BOTH_PANES_MIN_PX`). At 1024px and above they can occupy separate columns, alongside the rail. Resizing across this breakpoint changes the displayed pane but the current `narrowFocus` is React state, so rotation/resizing and return behavior need deliberate verification.
- The rail defaults to 252px and persists a user-resized 200–360px width. A width chosen on a large display can therefore consume too much of a medium portrait viewport unless the responsive design constrains or adapts it.
- Workspace-home spacing has mobile rules only below 768px. Its hero top offset is based on viewport height, while a compact exit bar is present below `md`. Short landscape viewports are a separate risk from narrow portrait viewports.
- The classroom pane hosts the shared classroom surface rather than a Pro-specific mobile editor. Its canvas, playback controls, dialogs, popovers, and any embedded content must be audited as part of this work.
- Existing scrollable surfaces include the workspace canvas, rail list, chat timeline, course-tab strip, menus, and popover panels. Responsive changes must retain a clear scroll owner and preserve keyboard/focus behavior.

## Target viewport matrix

| Profile | Example viewport | Main concern |
| --- | --- | --- |
| Medium portrait, narrow | 768 × 1024 | The 252px rail leaves limited width for the active pane; controls and composer must not wrap into unusable fragments. |
| Medium portrait, roomy | 820 × 1180 | Verify the same layout with more height, including the home hero, discovery feed, and keyboard-open composer. |
| Medium landscape, below dual-pane threshold | 900 × 600 | Rail plus one content pane; little vertical room for headers, timeline, and composer. |
| Threshold landscape | 1023 × 768 and 1024 × 768 | No layout jump, clipping, or lost focused pane as the second content pane becomes eligible. |
| Medium landscape, dual pane | 1180 × 820 | Rail, chat, and classroom must have useful minimum widths and independently usable headers. |
| Phone regression | 390 × 844 | Retain the existing compact header and single-pane behavior while validating safe areas and touch targets. |

Include both touch emulation and desktop browser testing at these CSS viewport sizes. Test portrait/landscape rotation without reloading.

## Responsive behavior to deliver

### 1. Define and document responsive tiers

- Treat the 768px rail threshold and 1024px dual-content threshold as first-class layout decisions rather than unrelated utility breakpoints.
- Decide whether the 768–899px band should default to the compact rail or keep the full rail. The preferred behavior is to reserve the narrowest band for compact navigation, with an explicit way to open the full navigation when needed.
- Keep one content pane active below the dual-pane threshold. Preserve the inactive pane behind an obvious, keyboard-accessible reopen control; do not make users re-open a course or conversation to recover it.
- On width changes and orientation changes, recompute which panes fit without discarding drafts, active course/session IDs, or the user's focused pane unexpectedly. Define the policy for widening back above 1023px and test it.
- Clamp any persisted rail width to the current viewport's usable width in responsive tiers; do not overwrite a user's desktop preference merely because the viewport temporarily became narrow.

### 2. Workspace home and Pro launch composer

- Revisit `.ws-home-first`'s `48vh - 127px` vertical-placement formula for short landscape heights, browser chrome changes, and on-screen keyboards. Use a bounded/clamped top spacing strategy that never pushes the composer below the useful first view or overlaps the compact exit bar.
- At medium portrait widths, check the 760px composer cap, 980px content cap, horizontal padding, lockup/badge alignment, tagline wrapping, and discovery section seam. Keep the identity mark centered and prevent the Pro badge from leaving the viewport.
- Let the launch prompt grow or scroll within a sensible maximum height. Keep attach, course-reference, skill, and send actions reachable when labels/localized text are long; wrap or move controls intentionally rather than allowing them to shrink to icon slivers.
- Test skill/course menus at the viewport edges. Keep menus within the visual viewport, with their own bounded scrolling, and ensure the software keyboard does not hide the active option or send action.
- Preserve draft text and focus through rotation, responsive layout changes, menu open/close, and switching away from and back to the Pro home.

### 3. Navigation rail and workspace controls

- Audit full and compact rail sizing at 768, 820, 900, and 1024px, including persisted widths at both bounds (200px and 360px), localization, browser zoom, and long course/session titles.
- At medium portrait widths, give navigation a compact default and a discoverable expanded/drawer state if the full rail crowds the active pane. Maintain focus trapping only if the expanded navigation is modal; otherwise preserve normal document navigation semantics.
- Ensure new-chat, search, home, settings, session list, course list, and Pro-exit actions have touch-sized hit areas and do not rely on hover-only disclosure.
- Keep selected and reopened pane controls visible when the rail is collapsed. Add labels or tooltips usable by touch/keyboard where compact icon buttons are used.
- Check rail scroll independently from workspace content and prevent resize handles from stealing normal touch scrolling. On touch devices, provide an accessible non-drag way to change or reset rail width if resizing remains a supported feature.

### 4. Conversation pane

- Test header composition (status, title, rename, fold/collapse, and actions) at narrow active-pane widths and with long localized titles. Allow the title to truncate without covering required controls.
- Verify the timeline is the pane's only primary vertical scroll region. Keep tool cards, question forms, code/output blocks, media, and long URLs within the available width; use wrapping or local horizontal scrolling only for content that requires it.
- Keep message composer, attachment/reference affordances, send/stop controls, and error/loading state visible above the software keyboard. Respect safe-area insets and avoid fixed controls covering the final message.
- Validate streaming and pending states while the device rotates or the pane changes between full-width and split layouts; session state and unsent drafts must survive.

### 5. Classroom pane and editor/playback

- Audit the shared `ClassroomSurface` in both editing and playback modes at tablet widths. Cover editor toolbars, slide/canvas sizing, scene/sidebar navigation, property panels, dialogs, popovers, selection handles, and playback controls.
- Prefer a single active editing surface at medium widths: secondary sidebars/panels may collapse into explicit drawers, but must retain their state and have clear open/close controls.
- Keep the presentation canvas proportional and centered without forcing the entire workspace wider than the viewport. Make slide/document content independently scrollable when necessary and keep zoom/pan controls operable with touch.
- Prevent headers and floating controls from colliding with the chat pane or device safe areas. Verify pointer, touch, stylus where available, keyboard shortcuts, and focus restoration after dialogs.

### 6. Shared overlays, menus, and accessibility

- Bound dialogs, context menus, skill pickers, course mention menus, settings, and destructive confirmations to the visual viewport (`dvh` where appropriate), with internal scrolling for tall content.
- Verify Escape/outside-press behavior, focus return, screen-reader names/states, tab order, and visible focus at every target viewport.
- Use at least 44 × 44 CSS-pixel targets for primary touch actions where practical. Support 200% zoom, text enlargement, reduced motion, high contrast/dark theme, and long translations without clipped labels.
- Respect `prefers-reduced-motion`; responsive layout changes and Pro-mode transitions must not depend on animation to communicate state.

## Implementation sequence

1. **Baseline and inventory:** Capture screenshots and interaction notes for each target viewport and workspace state (home, chat-only, classroom-only, chat + classroom, menus/dialogs open). Record horizontal overflow, clipped/folded controls, and scroll ownership.
2. **Breakpoint and state policy:** Document the rail and dual-pane thresholds, decide compact navigation behavior for 768–899px, and define pane focus behavior when rotating across 1024px. Keep the current URL as the source of pane identity and preserve mounted drafts/session state.
3. **Shell and home:** Implement responsive rail sizing/collapse and safe home/composer spacing first. Confirm compact exit, lockup, composer, and discovery feed at short landscape and medium portrait heights.
4. **Pane internals:** Adapt chat and classroom headers, toolbars, composers, and content surfaces. Keep pane-specific scroll containers independent and use drawers for secondary controls where space is insufficient.
5. **Overlays and touch:** Constrain all popovers/dialogs to the visual viewport, fix touch target and safe-area gaps, and verify keyboard/focus handling.
6. **Regression and polish:** Run the full viewport/rotation matrix in light and dark modes, with long localization strings, zoom, reduced motion, persisted rail settings, active drafts, streaming, and classroom playback/editing.

## Acceptance criteria

- No page-level horizontal scrolling at any target size or orientation; intentional code/canvas scrolling stays within its own surface.
- At 768–1023px, the rail and active content pane remain usable, and the inactive pane can be reopened without losing the current session, course, or draft.
- At and around 1024px, resizing/rotation causes no blank pane, clipped handle, unexpected state reset, or navigation jump.
- The Pro home composer, chat composer, primary classroom controls, and pane-switch controls remain visible and operable with the on-screen keyboard open.
- The home hero and Pro launch panel are usable at 900 × 600 landscape and do not reserve a large empty top region.
- Dialogs/popovers remain inside the visual viewport and have bounded internal scrolling; focus can enter, move within, dismiss, and return correctly.
- Touch actions do not require hover or precise dragging; keyboard and screen-reader users can reach every action.
- No drafts, session identities, selected courses, or classroom state are lost solely due to responsive breakpoint or orientation changes.
- Existing desktop behavior at wide viewports and the classic-home default/off state continue to pass regression checks.

## Verification checklist

- Playwright visual/interaction coverage for the viewport matrix, including exact 1023px/1024px boundary checks and portrait-to-landscape-to-portrait rotation.
- At each viewport, exercise workspace home, chat-only, classroom-only, both-pane mode, rail collapsed/expanded, menus/dialogs, and active composer focus.
- Assert document-level `scrollWidth <= clientWidth`, no element with primary controls is clipped, and focus remains visible after pane/overlay changes.
- Repeat with a narrow persisted rail width and a stale/max-width persisted value; verify medium widths remain usable without erasing the desktop preference.
- Exercise long localized labels, long titles, streaming conversation output, question forms, attachment chips, classroom editing, playback, and generated media.
- Run existing workbench unit and E2E suites plus lint/type checks after each implementation phase; compare screenshots against the baseline for both themes.
