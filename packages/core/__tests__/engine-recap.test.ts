import { describe, expect, test } from 'vitest';
import { createEngine, type EngineOptions } from '../src/create-engine.ts';
import { RECAP_HOLD_MS } from '../src/create-router.ts';
import type { Rect } from '../src/rect.ts';
import { BUILTIN, createManualHost, EXTERNAL, START } from './manual-host.ts';
import { screenRecorder } from './screen-recorder.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

/** A window covering both screens: the wallpaper is hidden. */
const EVERYTHING: Rect = { x: 0, y: 0, w: 3040, h: 900 };

/** Two hours: long enough for a recap. */
const TWO_HOURS = 2 * 3_600_000;

/**
 * Mounts a recording Theme on the MacBook and the external screen; `recaps: false` gives a Theme that draws none.
 * @example
 * const { engine, platform, recorder } = twoScreens();
 * recorder.instances.length; // 2
 */
function twoScreens(options: Partial<EngineOptions> = {}, recaps = true) {
  const platform = createManualHost({ screens: [BUILTIN, EXTERNAL] });
  const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO, ...options });
  const recorder = screenRecorder({ recaps });
  engine.mountScreens(recorder.theme, recorder.layers);

  return { engine, platform, recorder };
}

/**
 * Returns how many Events each screen's Theme received, keyed by screen id.
 * @example
 * played(recorder); // { builtin: 2, external: 1 }
 */
function played(recorder: ReturnType<typeof screenRecorder>): { builtin: number; external: number } {
  return { builtin: recorder.on('builtin').events.length, external: recorder.on('external').events.length };
}

describe('coming back to a hidden wallpaper', () => {
  test('keeps the Events missed while every screen is hidden, and sends the recap to the most visible screen', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'like-1', archetype: 'like', rarity: 'common' }));
    engine.send(tramloEvent({ id: 'like-2', archetype: 'like', rarity: 'common' }));
    engine.send(tramloEvent({ id: 'pr-1' }));
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([{ x: 0, y: 0, w: 2400, h: 900 }]);

    expect(played(recorder)).toEqual({ builtin: 0, external: 0 });
    expect(recorder.on('builtin').recaps).toEqual([]);

    const [recap] = recorder.on('external').recaps;
    expect(recap?.groups.map((group) => [group.archetype, group.count])).toEqual([
      ['approval', 1],
      ['like', 2],
    ]);
    expect(recap?.from).toEqual(new Date(START));
    expect(recap?.to).toEqual(new Date(START + TWO_HOURS));
    expect(recorder.on('external').host.today().roles.like).toBe(2);
  });

  test('replays a missed failed deploy on every screen once the recap has been read', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(
      tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', rarity: 'jackpot', step: 'failed' }),
    );
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([]);

    expect(played(recorder)).toEqual({ builtin: 0, external: 0 });

    platform.advance(RECAP_HOLD_MS);

    expect(recorder.on('builtin').events.map((event) => event.id)).toEqual(['d1']);
    expect(recorder.on('external').events.map((event) => event.id)).toEqual(['d1']);
  });

  test('drops the failed-deploy replay when the wallpaper hides again before it plays', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([]);
    platform.setWindowFrames([EVERYTHING]);
    platform.advance(RECAP_HOLD_MS);

    expect(played(recorder)).toEqual({ builtin: 0, external: 0 });
  });

  test('plays what a short hide kept as it arrived, without a recap', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'pr-1' }));
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.started', archetype: 'deploy', step: 'started' }));
    platform.advance(30_000);
    platform.setWindowFrames([]);

    expect(recorder.instances.flatMap((each) => each.recaps)).toEqual([]);
    expect(played(recorder).builtin + played(recorder).external).toBe(1 + 2);
  });

  test('waits as long as the options say before a return brings a recap', () => {
    const { engine, platform, recorder } = twoScreens({ recapAfter: 0 });

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'pr-1' }));
    platform.setWindowFrames([]);

    expect(recorder.instances.flatMap((each) => each.recaps)).toHaveLength(1);
  });

  test('brings no recap when nothing was missed', () => {
    const { platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([]);

    expect(recorder.instances.flatMap((each) => each.recaps)).toEqual([]);
  });

  test('counts a screen unplugged while hidden out of the wallpaper, so the other one brings it back', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    platform.setScreens([BUILTIN]);
    engine.send(tramloEvent({ id: 'pr-1' }));
    platform.advance(TWO_HOURS);
    platform.setScreens([BUILTIN, EXTERNAL]);

    expect(recorder.on('external').recaps).toHaveLength(1);
  });

  test('drops the failed-deploy replay when a newer deploy step arrives during the recap', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([]);
    engine.send(tramloEvent({ id: 'd2', kind: 'deploy.succeeded', archetype: 'deploy', step: 'succeeded' }));
    platform.advance(RECAP_HOLD_MS);

    expect(recorder.on('builtin').events.map((event) => event.id)).toEqual(['d2']);
    expect(recorder.on('external').events.map((event) => event.id)).toEqual(['d2']);
  });

  test('plays a failed deploy a short hide kept, even behind a dozen later Events', () => {
    const { engine, platform, recorder } = twoScreens();

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));
    for (let index = 0; index < 15; index += 1) engine.send(tramloEvent({ id: `pr-${index}` }));
    platform.advance(30_000);
    platform.setWindowFrames([]);

    expect(recorder.on('builtin').events.map((event) => event.id)).toContain('d1');
    expect(recorder.on('external').events.map((event) => event.id)).toContain('d1');
    expect(played(recorder).builtin + played(recorder).external).toBe(2 + 12);
  });

  test('plays the kept Events instead of a recap when the most visible screen’s Theme draws none', () => {
    const { engine, platform, recorder } = twoScreens({}, false);

    platform.setWindowFrames([EVERYTHING]);
    engine.send(tramloEvent({ id: 'pr-1' }));
    platform.advance(TWO_HOURS);
    platform.setWindowFrames([]);

    expect(played(recorder).builtin + played(recorder).external).toBe(1);
  });
});
