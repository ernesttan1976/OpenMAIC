# Plan: Edit animated slides with AI

## Goal

Make the existing per-slide **Edit with AI** workflow work for animated slides: users can request visual/content changes or animation changes, and the saved result keeps valid element animations and slide-transition settings. Animation behavior must not disappear just because the slide was edited.

## Current behavior and architecture

- A slide is a `Scene` whose `type` is `slide`; it is not a separate animated-scene type. Its `content.canvas` is the DSL `Slide` object.
- Element animations live in `canvas.animations`. Each animation has an `elId` reference to a canvas element, an effect/type, duration, and trigger. Slide-to-slide transitions are stored separately as `canvas.turningMode`.
- `components/edit/SlideNavRail/ThumbItem.tsx` currently offers the AI action to all `scene.type === 'slide'` items. `SlideNavRail.tsx` submits a stable scene id through the existing workbench conversation path. No separate animated-slide button is needed for this data model.
- The server resolves that request through the existing `generate_scene` edit flow in `lib/server/agent-runtime/generation-tools.ts`. `prepareSceneEdit` already serializes the current scene as prompt context, including its canvas animations and transition mode, while making media prompt-safe.
- The generated-slide contract (`GeneratedSlideContent` in `packages/@openmaic/generation/src/scene-types.ts`) currently contains only elements/background/remark; slide generation does not return animation metadata.
- On the client, `toRuntimeSlideContent` in `lib/agent/client/apply-regenerate.ts` spreads the existing canvas (so `turningMode` and other canvas metadata survive) but explicitly sets `animations: []`. The comment and existing tests make this intentional: regenerated element ids could leave old animation `elId`s dangling. As a result, AI edits discard all element animations, even though the model receives the prior animation data as context.

## Proposed implementation

### 1. Extend the generated slide edit contract

- Add an optional `animations` field to `GeneratedSlideContent`, typed from the canonical DSL animation type, and extend the generated-response/schema validation so models can return animation definitions.
- Keep it optional for compatibility with existing generation callers and model responses. Normal new-slide generation should continue to work when the field is omitted.
- Update the slide edit prompt to call out the existing `canvas.animations` and `turningMode` from scene context. For content-only requests, preserve animation behavior for unchanged elements. For explicit animation requests, apply the requested effects, ordering/triggers, duration, and transition changes while preserving unrelated content.
- Require stable element ids for unchanged elements so their animations stay bound. For a replaced/removed element, the returned animation must reference the corresponding returned element id; do not retain stale references.

### 2. Validate animation output and preserve safe existing behavior

- Validate returned animation objects against the DSL contract: unique animation ids, valid animation type/trigger, valid duration/effect shape, and `elId` references that resolve to elements in the returned slide.
- Update `toRuntimeSlideContent` to accept the existing canvas (or existing animation list) and apply the following policy:
  - If generated output includes `animations`, use the validated list.
  - If output omits `animations`, preserve prior animation records only when their target element ids still exist in the generated elements; discard only records that would be dangling.
  - Preserve the existing `turningMode` unless the user explicitly asks to change slide transitions. If transition editing is supported in this pass, add it as a separately validated generated field; otherwise retain it untouched and scope AI edits to element animations.
- Keep the existing snapshot/restore behavior so the previous canvas, including its animations, can be restored after an AI edit.
- Ensure failure or invalid animation data does not write a partial replacement. Follow the established validation/error path and surface a retryable tool error.

### 3. Keep the existing UI and targeting lifecycle

- Reuse the current slide-rail action, dialog, stable scene-id message, workbench submission path, and server-side persisted-scene context. Do not add a parallel API or send a browser-captured canvas snapshot.
- Confirm that animation slides are still represented as `type: 'slide'` at the UI boundary. If persisted legacy data has a distinct shape, normalize/cover that separately rather than branching the main editor UI on guessed animation flags.
- Update agent/tool guidance so an explicit edit to a selected animated slide uses `generate_scene` with the selected `sceneId`, and so the user's request determines whether to preserve or change animation behavior.

### 4. Protect edited slide identity and metadata

- Preserve the existing behavior that the server resolves by stable `sceneId`, validates stage and slide type, and keeps current order/title unless asked otherwise.
- Preserve actions/narration for visual-only edits and preserve canvas metadata (including `turningMode`) while replacing content.
- Keep media references prompt-safe and reversible. Animation support must not regress existing image/video/audio asset preservation or the write-conflict checks in `generate_scene`.

## Verification plan

### Focused unit tests

- Extend `tests/lib/agent/client/apply-regenerate.test.ts` to cover:
  - Generated animation definitions are applied.
  - Existing animations survive an output without an `animations` field when their element ids remain present.
  - Animations targeting removed elements are filtered, never persisted as dangling references.
  - Existing `turningMode` survives content regeneration when not explicitly changed.
  - Snapshot/restore retains the original animation list.
- Extend generation tests (including `packages/@openmaic/generation/test/slide-edit-directive.test.ts`) to assert that edit prompts include the existing animation context, distinguish user instructions from untrusted scene data, and ask for animation preservation unless changes are requested.
- Add validation tests for malformed animation objects, duplicate ids, and references to missing elements; invalid output must fail without persisting a replacement.
- Extend `generation-tools` tests to cover an animation-aware edit from current persisted scene data, stable scene-id targeting after reorder, preservation of actions on visual-only edits, and persistence of valid edited animations.
- Keep the existing `slide-nav-thumb-edit` coverage; add/adjust a case with `canvas.animations` to document that animated and non-animated slides use the same action path. Retain coverage that non-slide scene types do not expose the slide action.

### Integration/manual checks

- Edit an animated slide with a content-only instruction; verify unchanged element animations still play and removed/replaced elements do not retain stale effects.
- Request an animation change in natural language; verify the returned animation list is valid and plays in the editor and playback renderer.
- Request a visual-only edit and verify the slide transition mode, title/order, narration/actions, and unrelated pages remain unchanged.
- Exercise a failed generation and restore-previous flow; verify the current document remains valid and the old animation state can be restored.
- Run focused editor/apply-regenerate, generation-prompt, generation-tool, and slide renderer tests, then relevant typecheck/lint checks.

## Acceptance criteria

1. AI editing is available on all slide scenes, animated or not, through the same UI and conversation workflow.
2. A visual/content-only edit preserves animation definitions for unchanged elements and does not introduce dangling element references.
3. A user-requested animation edit can add, remove, or modify supported element animations and persists only valid output.
4. Existing slide transition mode and unrelated scene metadata remain intact unless the user explicitly changes them.
5. Invalid generation output or a failed edit leaves the persisted slide unchanged; the previous-state restore path includes animations.

## Scope note

The plan treats “animated slides” as regular slide scenes with `canvas.animations`. It also accounts for `canvas.turningMode`, but prioritizes preserving it; authoring new slide-transition behavior can be included only if the generated-content contract and renderer verification are deliberately expanded for that feature.
