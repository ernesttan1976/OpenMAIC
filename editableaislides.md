# Per-slide AI editing from the slide outline

## How the app turns a lesson plan into slides

The app treats the lesson plan and the finished classroom pages as related, but distinct, data:

- A **lesson plan** is an ordered list of `SceneOutline` objects. An outline typically has an id, order, title, scene type, description, key points, and optional type-specific configuration. It describes what a page should teach; it is not the rendered slide itself.
- A **finished slide/page** is a persisted `Scene`. For a slide scene it contains the canvas (elements and background), plus playback actions such as narration/speech and other actions. The outline id links it back to the plan.

The main interactive flow works as follows:

1. **Create and persist the stage early.** `app/generation-preview/page.tsx` creates the stage and saves generation context so the plan and generation job can be resumed.
2. **Generate the plan.** The preview posts requirements and any PDF/research context to `/api/generate/scene-outlines-stream`. The server streams the inferred course title/language directive and outlines. The client collects the outlines, assigns/preserves their order, saves them, and may show the outline editor for user review before continuing.
3. **Generate the first page.** After the user confirms or the review timer continues, the preview calls `fetchSceneContent` for the first outline. `/api/generate/scene-content` delegates to `generateSceneContent` in `packages/@openmaic/generation`. For a `slide` outline, that generator returns slide content (the canvas element data and background); other scene types take their own content-generation paths.
4. **Generate playback behavior separately.** The preview sends the outline and generated content to `/api/generate/scene-actions`. That route calls `generateSceneActions`, with course context such as page index, total pages, all page titles, previous narration, agents, and language. It then calls `buildCompleteScene` to combine outline, content, actions, and stage id into a complete scene.
5. **Add the first scene, then generate the rest.** The first scene is added to the stage store and saved. The remaining outlines are represented as generating placeholders. `lib/hooks/use-scene-generator.ts` generates their content and actions, optionally prefetching content with bounded concurrency. It consumes pages in order; actions and TTS remain ordered so previous-speech context stays coherent. Completed scenes are added to the store, while failures can pause and be retried.
6. **Finish media, narration, and persistence.** Media generation may replace placeholders and TTS may attach audio. Stage/scene state is persisted through the existing classroom storage paths.

There is also a server-side batch path in `lib/server/classroom-generation.ts`. It follows the same core sequence—generate outlines, generate each scene's content, generate its actions, assemble scenes with `createSceneWithActions`, then generate optional media/TTS and persist. These paths share the generation package rather than having separate slide schemas.

### Existing AI regeneration path

The workbench agent already has a `generate_scene` tool in `lib/server/agent-runtime/generation-tools.ts`. It can replace an existing page: it loads the persisted document, builds a generation outline from the tool arguments, calls `generateSceneContent`, calls the action generator, assembles the result with `buildCompleteScene`, then persists through the mutation-fenced document write. For an instructed edit of an existing slide, it passes the existing canvas elements and background as `baselineContent`; `generateSceneContent` adds an `EDIT MODE` block containing the instruction and baseline. The rebuilt scene keeps the existing scene id when replacing the same page.

That is the right existing generation path to build on for whole-slide edits. There is an important scope gap: the current baseline passed into the slide-content prompt is only `canvas.elements` and `canvas.background`. It does **not** itself include the complete persisted scene record, such as the existing actions/narration and all scene-level metadata. Also, `generate_scene` currently targets an existing scene by page order, not stable scene id, and regenerates actions after content. A feature promising the *current slide fully as context* must address those facts rather than claim the current baseline already includes the entire slide.

## Implementation plan

### 1. Add an edit action to each slide item

- In `components/edit/SlideNavRail/ThumbItem.tsx`, add an `Edit with AI` menu item for `scene.type === 'slide'` only. Use the existing per-item overflow menu so thumbnails keep their compact visual design.
- Add an `onEditWithAi` callback to `ThumbItemProps` and pass it down from `SlideNavRail.tsx`.
- Stop menu event propagation as the other menu actions do, so the action does not also activate the thumbnail or begin a drag.
- Capture the selected scene id when opening the form. Do not rely on the thumbnail's current array index after opening, because a reorder can occur while the form is open.

### 2. Collect the user's edit instruction

- Own the form/dialog state in `SlideNavRail` or a small component colocated with it. Show the selected page title/order, a required multiline instruction, Cancel, and Submit.
- Validate trimmed non-empty input, expose pending/error state, prevent duplicate submits, and keep the dialog accessible by keyboard.
- Add the UI copy under `edit.nav` in all supported locale resources; `tests/i18n/edit-chrome-keys.test.ts` enforces translation coverage.

### 3. Send through the ordinary workbench conversation path

- Submit the instruction as an ordinary user message so existing session history, agent runtime, tool calls, stream updates, and persistence remain the source of truth.
- Reuse the same submission lifecycle as `WorkbenchChat.submit`, not just its low-level `postWorkbenchMessage` request. The chat submit path owns the busy guard, pending-send state, draft-conversation bootstrap, and send-failure toast. Provide a narrow callback/context seam from the workbench chat/workspace to the hosted classroom rail, or extract a shared submit controller if needed; do not duplicate this lifecycle in `SlideNavRail`.
- When the active workbench session is attached, submit through that shared path. When the workspace is showing a draft conversation, use its existing `startConversationWithFirstMessage` flow and let the workspace load/attach the created session through its normal navigation path. Do not mint a session just because the dialog opened. Define the behavior for a standalone editor without a hosted workbench chat (for example, open the workspace through its normal entry path and deliver the first message there) rather than calling the bootstrap helper without the workspace attachment behavior.
- Include the course/stage id, stable scene id, and a human-readable page order/title in the message. Make the instruction explicit: edit only the selected page; preserve unrelated content and course pages; preserve title/order unless asked to change them.
- The browser should send the target and instruction, not a second, potentially stale copy of the canvas JSON. The server should load the current persisted scene when executing the edit.

### 4. Make the AI's edit context complete and stable

- Extend the existing agent-generation path rather than adding a parallel slide-generation API. Reuse `generate_scene` and `generateSceneContent` for full-page regeneration so the existing slide schema, media handling, `buildCompleteScene`, and mutation-fenced persistence stay in force. Let the agent use existing fine-grained edit tools for requests that are better handled as targeted patches.
- Extend the `generate_scene` target resolution to accept an optional `sceneId`, following the existing `generate_actions` tool's scene-id lookup pattern. Resolve by id for this UI flow, verify it is a slide in the requested stage, and use order for compatibility with existing/new-page calls. This prevents a reorder from changing which page an already-submitted edit targets.
- If `sceneId` is supplied but is missing or does not identify a slide in the requested stage, return an error without falling back to `order`; falling back could silently edit a different page. Keep `order` required/usable for legacy and new-page calls, but make the stable id authoritative for this UI flow.
- For an existing id-targeted edit, derive the effective order from the current persisted scene. Preserve its title by default even if the agent's tool arguments contain stale values; apply a title change only when the requested edit explicitly asks for it. If the user also asks to reorder the page, use `edit_deck` so neighboring scenes and outline orders remain aligned. Preserve the same scene id and outline association when assembling the replacement.
- Add a server-built edit-context option to the content-generation prompt. Build it from the current persisted scene at tool execution time and include the full authored slide state relevant to editing: scene id/order/title/type and metadata, the complete canvas element objects and background, plus existing actions/narration and type-specific authored content where applicable. Include asset/image references and descriptive metadata, but do not inline raw binary/base64 media payloads.
- Build a media-safe prompt projection before serializing either the baseline canvas or the additional scene context. The current `generate_scene` path passes existing canvas elements directly as `baselineContent`, and the slide prompt serializes that baseline; do not assume existing images have already been lifted into `assignedImages` or that their `src` values are safe to inline. Reuse the existing asset/media resolution path where possible, represent prompt-visible assets with stable references and useful metadata, and preserve the real persisted references when assembling the replacement. Cover data URLs as well as explicit base64 fields; preserve non-inline image/video/audio references without uploading the whole scene from the browser.
- Mark serialized scene/context data as untrusted data in the prompt, distinct from the user's instruction, consistent with the agent runtime's treatment of referenced element data. Keep the existing baseline canvas block for the generator's visual regeneration rules while adding the rest of the current scene context.
- Treat content and actions as distinct phases, as in normal generation. `generate_scene` currently regenerates actions for every replacement and does not pass the page/course context that `generate_actions` supplies. For a visual/content-only instruction, preserve existing actions/narration unless the edit changes them or the user asks for narration/action changes. If actions are regenerated, do so deliberately with the existing action generator and the current `actionContext` (page index, total pages, titles, and previous speeches), plus the current agents/language settings, rather than silently replacing unrelated narration.
- Keep generated media handling consistent with current behavior: preserve existing image assets/references when possible, and do not turn them into omitted placeholders or require the browser to upload the full slide.

### 5. Preserve existing lifecycle and failure behavior

- Persist through the current `generate_scene` document-write/mutation-fence path, preserving the selected scene id and order unless the user explicitly requested otherwise.
- Define the write-conflict behavior for edits made while generation is running. The scene is loaded before the model call, and the existing write replaces it by id; the mutation fence does not by itself ensure that a browser autosave made during generation is incorporated. Before writing, re-read the current document and at minimum retain the latest order/title/outline association for the targeted id. For concurrent authored-content changes to that same scene, either detect a changed version and fail with a retryable conflict (preferred over silently losing edits), or document and test an explicit last-writer-wins policy. Never let the generated write reorder or replace a different scene because the deck changed during generation.
- Surface agent errors through the existing workbench chat receipts/toasts; keep the form available for retry if message submission is rejected. Once accepted, the conversation stream should report progress and completion as it does for other agent edits.
- Do not write partial output if generation fails. The existing tool returns an error before writing when content/assembly fails; retain that boundary.

## Verification plan

- Add focused `ThumbItem`/rail tests: the action is visible for slide scenes only, opens the form with the right target, menu interaction does not activate the thumbnail, blank instructions cannot be submitted, and reorder does not change the selected scene id.
- Test request/bootstrap wiring through the shared chat submit lifecycle: an attached session uses ordinary message submission with pending/busy/error behavior; a draft conversation uses the existing first-message and workspace attachment/navigation flow; opening and cancelling the dialog creates no session; submission rejection leaves the form retryable. Verify the submitted message identifies the target and preserves the user's instruction.
- Add generation-tool tests for stable scene-id resolution, no order fallback for an invalid supplied id, stage/type validation, preservation of title/order/outline association (including a stale order argument), and legacy order-based behavior.
- Extend the slide edit prompt tests to verify that the edit instruction and full current scene context are passed separately from untrusted scene data, including canvas details and actions/narration. Cover image data URLs/base64 and metadata/references for image, video, and audio assets; verify bytes are not inlined and existing asset references remain resolvable after generation.
- Test the action policy: visual-only edits preserve existing actions/narration, while requested action changes use the action generator with the current page/course context.
- Test that a failed generation does not persist a replacement, a successful replacement keeps the same scene id/order unless explicitly changed, and a write detects or correctly handles a concurrent edit/reorder during generation without modifying a different page.
- Run the focused rail, agent-generation, slide-edit-directive, and i18n tests, followed by the repository's relevant type/lint checks.

## Architectural decision

The slide outline remains the lesson plan, not the editing context. The edit target is the current persisted `Scene`. The UI identifies which scene the user means; the existing workbench agent handles the request; and the server supplies the fresh, complete scene context to the existing generation/edit tools. This follows the current outline → content → actions → assembled scene pipeline while closing the gap between the current canvas-only regeneration baseline and the requested full-slide context.
