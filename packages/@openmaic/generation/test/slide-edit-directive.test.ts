/**
 * Edit-mode regeneration: `editDirective` + `baselineContent` thread into the
 * slide content prompt so the agent's `regenerate_scene` tool can steer a
 * whole-slide regeneration with a natural-language instruction, using the
 * current slide as the edit baseline.
 *
 * When no `editDirective` is supplied, the slide content prompt MUST be
 * unchanged (no EDIT MODE block) — a regression guard for the default
 * course-generation path.
 */
import { describe, expect, it } from 'vitest';

import { generateSceneContent } from '@openmaic/generation';
import type { AICallFn } from '@openmaic/generation';
import type { SceneOutline, GeneratedSlideContent } from '@openmaic/generation';

const INSTRUCTION = '<<EDIT-INSTRUCTION-SENTINEL>> make it concise';

function makeCapturingAiCall(response: string): { aiCall: AICallFn; lastUser: () => string } {
  let lastUser = '';
  const aiCall: AICallFn = async (_system, user) => {
    lastUser = user;
    return response;
  };
  return { aiCall, lastUser: () => lastUser };
}

function slideOutline(overrides: Partial<SceneOutline> = {}): SceneOutline {
  return {
    id: 'scene-1',
    type: 'slide',
    title: 'Test Scene',
    description: 'A scene for testing edit-mode threading.',
    keyPoints: ['point a', 'point b'],
    order: 0,
    ...overrides,
  };
}

const BASELINE: GeneratedSlideContent = {
  elements: [
    {
      id: 'text_baseline',
      type: 'text',
      left: 0,
      top: 0,
      width: 100,
      height: 40,
      content: '<p>BASELINE-ELEMENT-SENTINEL</p>',
      defaultFontName: '',
      defaultColor: '#000',
      rotate: 0,
    },
  ],
  animations: [
    {
      id: 'anim_baseline',
      elId: 'text_baseline',
      type: 'in',
      effect: 'fadeIn',
      duration: 0.5,
      trigger: 'click',
    },
  ],
  background: undefined,
  remark: '',
};

describe('slide content edit-mode directive', () => {
  it('threads editDirective + baselineContent into the slide content prompt', async () => {
    const { aiCall, lastUser } = makeCapturingAiCall(
      JSON.stringify({ elements: [], background: null, remark: '' }),
    );

    await generateSceneContent(slideOutline(), aiCall, {
      editDirective: INSTRUCTION,
      baselineContent: BASELINE,
    });

    expect(lastUser()).toContain('EDIT MODE');
    expect(lastUser()).toContain(INSTRUCTION);
    // The baseline slide is serialized into the prompt so content-specific
    // instructions ("drop the 2nd bullet") operate on the real slide.
    expect(lastUser()).toContain('BASELINE-ELEMENT-SENTINEL');
    expect(lastUser()).toContain('anim_baseline');
    expect(lastUser()).toContain('unchanged element');
    expect(lastUser()).toContain('turningMode');
  });

  it('leaves the slide content prompt unchanged when no editDirective is given', async () => {
    const { aiCall, lastUser } = makeCapturingAiCall(
      JSON.stringify({ elements: [], background: null, remark: '' }),
    );

    await generateSceneContent(slideOutline(), aiCall, {});

    expect(lastUser()).not.toContain('EDIT MODE');
  });

  it('uses the baseline for a faithful re-render when no editDirective is given', async () => {
    const { aiCall, lastUser } = makeCapturingAiCall(
      JSON.stringify({ elements: [], background: null, remark: '' }),
    );

    await generateSceneContent(slideOutline(), aiCall, { baselineContent: BASELINE });

    // A baseline alone (no instruction) must still enter EDIT MODE so the model
    // re-renders the existing slide rather than generating one from scratch.
    expect(lastUser()).toContain('EDIT MODE');
    expect(lastUser()).toContain('BASELINE-ELEMENT-SENTINEL');
    expect(lastUser()).toContain('faithfully');
  });

  it('instructs the model to keep baseline images', async () => {
    const { aiCall, lastUser } = makeCapturingAiCall(
      JSON.stringify({ elements: [], background: null, remark: '' }),
    );

    const baselineWithImage: GeneratedSlideContent = {
      elements: [
        {
          id: 'img_1',
          type: 'image',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          src: 'https://example.com/i.png',
          rotate: 0,
        } as never,
      ],
      background: undefined,
      remark: '',
    };

    await generateSceneContent(slideOutline(), aiCall, {
      editDirective: INSTRUCTION,
      baselineContent: baselineWithImage,
    });

    expect(lastUser()).toContain('KEEP them');
  });

  it('serializes the baseline plainly (no [omitted] strip; images flow as img_N id-refs)', async () => {
    const { aiCall, lastUser } = makeCapturingAiCall(
      JSON.stringify({ elements: [], background: null, remark: '' }),
    );

    // The caller (regenerate_scene) lifts real image srcs into the resource
    // channel BEFORE calling the generator, so the baseline handed here already
    // carries small img_N id-refs — no base64 to strip. The generator must
    // serialize it verbatim (no '[omitted]' placeholder).
    const baselineWithIdRef: GeneratedSlideContent = {
      elements: [
        {
          id: 'img_data',
          type: 'image',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          src: 'img_1',
          rotate: 0,
        } as never,
      ],
      background: undefined,
      remark: '',
    };

    await generateSceneContent(slideOutline(), aiCall, {
      editDirective: INSTRUCTION,
      baselineContent: baselineWithIdRef,
    });

    const prompt = lastUser();
    // No strip placeholder — the baseline is serialized plainly.
    expect(prompt).not.toContain('[omitted]');
    // The id-ref is threaded into the prompt as-is.
    expect(prompt).toContain('"src":"img_1"');
    // An image element is present, so the KEEP-images rule applies.
    expect(prompt).toContain('"type":"image"');
    expect(prompt).toContain('KEEP them');
  });

  it('keeps returned animation ids bound to stable edited element ids', async () => {
    const { aiCall } = makeCapturingAiCall(
      JSON.stringify({
        elements: [
          {
            id: 'text_baseline',
            type: 'text',
            left: 0,
            top: 0,
            width: 100,
            height: 40,
            content: '<p>Updated</p>',
          },
        ],
        animations: [
          {
            id: 'anim_updated',
            elId: 'text_baseline',
            type: 'attention',
            effect: 'pulse',
            duration: 1,
            trigger: 'auto',
          },
        ],
        background: null,
        remark: '',
      }),
    );

    const result = await generateSceneContent(slideOutline(), aiCall, {
      editDirective: 'Add a subtle emphasis animation',
      baselineContent: BASELINE,
    });
    if (!result || !('elements' in result)) throw new Error('expected generated slide content');
    expect(result?.elements[0]?.id).toBe('text_baseline');
    expect(result?.animations).toEqual([
      {
        id: 'anim_updated',
        elId: 'text_baseline',
        type: 'attention',
        effect: 'pulse',
        duration: 1,
        trigger: 'auto',
      },
    ]);
  });

  it.each([
    ['malformed animation shape', [{ id: 'a', elId: 'text_baseline', type: 'in' }]],
    [
      'duplicate animation ids',
      [
        {
          id: 'a',
          elId: 'text_baseline',
          type: 'in',
          effect: 'fadeIn',
          duration: 1,
          trigger: 'click',
        },
        {
          id: 'a',
          elId: 'text_baseline',
          type: 'out',
          effect: 'fadeOut',
          duration: 1,
          trigger: 'auto',
        },
      ],
    ],
    [
      'missing element references',
      [{ id: 'a', elId: 'missing', type: 'in', effect: 'fadeIn', duration: 1, trigger: 'click' }],
    ],
  ])('rejects %s without returning slide content', async (_caseName, animations) => {
    const { aiCall } = makeCapturingAiCall(
      JSON.stringify({
        elements: [
          {
            id: 'text_baseline',
            type: 'text',
            left: 0,
            top: 0,
            width: 100,
            height: 40,
            content: '<p>Updated</p>',
          },
        ],
        animations,
        background: null,
        remark: '',
      }),
    );
    let failure: string | undefined;
    const result = await generateSceneContent(slideOutline(), aiCall, {
      editDirective: 'Change the animation',
      baselineContent: BASELINE,
      onFailure: ({ code }) => {
        failure = code;
      },
    });
    expect(result).toBeNull();
    expect(failure).toBe('invalid-model-output');
  });
});
