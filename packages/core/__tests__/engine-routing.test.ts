import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import { BUILTIN, createManualHost, EXTERNAL } from './manual-host.ts';
import { screenRecorder } from './screen-recorder.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

/**
 * Mounts a recording Theme on the MacBook and the external screen through an engine on a manual host.
 * @example
 * const { engine, platform, recorder } = twoScreens();
 * engine.send(tramloEvent()); // one of the two screens' Themes receives it
 */
function twoScreens() {
  const platform = createManualHost({ screens: [BUILTIN, EXTERNAL] });
  const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO });
  const recorder = screenRecorder();
  const unmount = engine.mountScreens(recorder.theme, recorder.layers);

  return { engine, platform, recorder, unmount };
}

/**
 * Sends `count` distinct merged pull requests.
 * @example
 * sendMany(engine, 10); // ten merged pull requests, ids pr-0 to pr-9
 */
function sendMany(engine: ReturnType<typeof createEngine>, count: number): void {
  for (let index = 0; index < count; index += 1) engine.send(tramloEvent({ id: `pr-${index}` }));
}

describe('an engine on several screens', () => {
  test('mounts one Theme instance per screen, at its own size, on its own layer', () => {
    const { recorder } = twoScreens();

    expect(recorder.instances.map((each) => [each.host.screen.id, each.layer])).toEqual([
      ['builtin', 'layer of builtin at 1440x900'],
      ['external', 'layer of external at 1600x900'],
    ]);
    expect(recorder.on('external').host.screens()).toEqual([BUILTIN, EXTERNAL]);
  });

  test('plays each Event on one screen, drawn in proportion to visible wallpaper area', () => {
    const { engine, recorder } = twoScreens();

    sendMany(engine, 400);

    const builtin = recorder.on('builtin').events.length;
    const external = recorder.on('external').events.length;
    expect(builtin + external).toBe(400);
    // 1440 x 900 against 1600 x 900: the MacBook shows 47 % of the wallpaper.
    expect(builtin / 400).toBeCloseTo(0.47, 1);
  });

  test('weighs a screen by the wallpaper it shows, and never sends to a covered one', () => {
    const { engine, platform, recorder } = twoScreens();
    platform.setWindowFrames([{ x: 1440, y: 0, w: 1200, h: 900 }]);

    sendMany(engine, 200);

    // 1440 x 900 against the external screen's last 400 x 900.
    expect(recorder.on('builtin').events.length / 200).toBeCloseTo(0.78, 1);

    platform.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    engine.send(tramloEvent({ id: 'after-cover' }));

    expect(recorder.on('builtin').host.isHidden()).toBe(true);
    expect(recorder.on('external').events.at(-1)?.id).toBe('after-cover');
  });

  test('plays deploys on every screen, the hidden ones included', () => {
    const { engine, platform, recorder } = twoScreens();
    platform.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);

    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.started', archetype: 'deploy', step: 'started' }));
    engine.send(tramloEvent({ id: 'd2', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));

    for (const id of ['builtin', 'external']) {
      expect(recorder.on(id).events.map((event) => event.meta.step)).toEqual(['started', 'failed']);
    }
  });

  test('plays a step sent with another Role, or with a deploy nobody described, on one screen only', () => {
    const { engine, recorder } = twoScreens();

    engine.send(tramloEvent({ id: 'e1', kind: 'error.raised', archetype: 'error', step: 'failed' }));
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.odd', archetype: 'deploy', recognised: false, step: 'failed' }));

    expect(recorder.on('builtin').events.length + recorder.on('external').events.length).toBe(2);
    expect(recorder.on('builtin').host.gauges().build).toBe('idle');
  });

  test('shares Gauges and today’s counts between the screens', () => {
    const { engine, recorder } = twoScreens();

    engine.setGauges({ crowd: 5 });
    sendMany(engine, 3);

    for (const id of ['builtin', 'external']) {
      expect(recorder.on(id).host.gauges().crowd).toBe(5);
      expect(recorder.on(id).host.today().roles.approval).toBe(3);
    }
  });
});
