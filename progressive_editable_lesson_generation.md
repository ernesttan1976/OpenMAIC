# Progressive Editable Lesson Generation

## Current Flow

1. Generate an outline in `/generation-preview`, where it is editable.
2. Create the classroom and generate the first scene.
3. Navigate to `/classroom/[id]`; remaining scenes generate sequentially in the background.
4. The standalone editor is feature-gated and, while any later scene is generating, editing is blocked for the entire deck.

This makes the experience feel one-shot: outline review is transient, intermediate content and actions are not durable user-visible artifacts, and generation is tied to browser session state.

## Recommended Flow

Make the course a durable, editable draft from the first click.

### 1. Draft Setup

- Persist a `CourseDraft` immediately.
- Show inputs, source material, settings, and the generation plan.

### 2. Outline Review

- Generate and save the outline as a versioned artifact.
- Let users edit, reorder, add, remove, and regenerate individual outline items.
- Provide explicit actions: `Approve plan` and `Generate selected scenes`.

### 3. Scene-by-Scene Generation

- Each scene has independent states: `planned`, `generating content`, `ready for review`, `generating media`, `complete`, and `failed`.
- Show the content brief, generated content, actions and layout, narration, and media prompts before or after assembling the slide.
- Provide per-scene controls: `Edit brief`, `Regenerate`, `Pause`, `Cancel`, `Retry`, and `Generate next`.

### 4. Editable Canvas Immediately

- Enable canvas editing as soon as a slide scene materializes.
- Do not block edits to completed slides while later slides generate.
- Treat AI generation and human edits as revisions. AI regeneration creates a proposed revision and never silently overwrites manual work.

### 5. Completion and Publishing

- `Generation complete` means the initial plan is done; it does not freeze the deck.
- Keep the deck editable indefinitely.
- Add an explicit `Publish` or `Export` snapshot. Later edits create a new draft revision.

## Implementation Direction

- Use the existing Pro/workspace page-level edit behavior as the intended default. It already permits editing a materialized page while later scenes generate.
- Remove the standalone whole-deck edit gate based on `generatingOutlines`; gate only the selected scene.
- Turn the current outline/session and per-scene API outputs into persisted draft/job records instead of relying on `sessionStorage`.
- Expose generation as a durable job API with per-scene progress, pause, cancel, and retry so refreshes and new devices do not lose control.
- Enable the existing editor in deployments with `NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true` or `NEXT_PUBLIC_PRO_WORKBENCH_ENABLED=true`, since it is off by default today.

## Principle

AI produces proposed revisions; the user owns the course draft at every step.
