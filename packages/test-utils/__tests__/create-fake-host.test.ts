import { createEngine, type Rect, type Screen, type ScreenHost } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { createFakeHost } from '../src/create-fake-host.ts';
import { FAKE_SCREEN } from '../src/fake-screen.ts';
import { sourceEventFixture } from '../src/source-event-fixture.ts';
import { sourceProfileFixture } from '../src/source-profile-fixture.ts';

/** A 16:9 screen right of the MacBook. */
const EXTERNAL: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };

describe('the fake Host', () => {
  test('lets the engine mount a Theme and forward fixtures to it', () => {
    const host = createFakeHost({ start: 1000 });
    const engine = createEngine(host, { lang: 'en', seed: 3, source: sourceProfileFixture() });
    const seen: string[] = [];
    let mounted: ScreenHost | undefined;

    engine.mount(
      {
        name: 'recording',
        mount(_layer: null, screenHost) {
          mounted = screenHost;
          return screenHost.onEvent((event) => seen.push(`${event.label} at ${screenHost.clock.now()}`));
        },
      },
      null,
    );
    host.clock.advance(500);
    engine.send(sourceEventFixture({ archetype: null, recognised: false }));

    expect(mounted?.screen.id).toBe('builtin');
    expect(mounted?.source.gauges.daily.label).toBe('Commits today');
    expect(seen).toEqual(['Pull request merged at 1500']);
  });

  test('reports no window until a test moves some, then tells its followers', () => {
    const host = createFakeHost();
    const heard: (readonly Rect[])[] = [];
    expect(host.windowFrames()).toEqual([]);

    const cancel = host.onWindowFrames((frames) => heard.push(frames));
    host.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);
    cancel();
    host.setWindowFrames([]);

    expect(heard).toEqual([[{ x: 0, y: 0, w: 720, h: 900 }]]);
    expect(host.windowFrames()).toEqual([]);
  });

  test('lets the engine follow screens a test plugs in', () => {
    const host = createFakeHost();
    const engine = createEngine(host, { lang: 'en', seed: 3, source: sourceProfileFixture() });
    const mounted: string[] = [];

    engine.mountScreens(
      {
        name: 'recording',
        mount(_layer: null, screenHost) {
          mounted.push(`${screenHost.screen.id} ${screenHost.screen.width}x${screenHost.screen.height}`);
          return () => {};
        },
      },
      { open: () => null, close: () => {} },
    );
    host.setScreens([FAKE_SCREEN, EXTERNAL]);

    expect(mounted).toEqual(['builtin 1440x900', 'external 1600x900']);
    expect(host.screens()).toEqual([FAKE_SCREEN, EXTERNAL]);
  });
});
