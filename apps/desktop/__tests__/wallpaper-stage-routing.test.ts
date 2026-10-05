import type { Rect } from '@deskorama/core';
import { sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import {
  EVENT_CHANNEL,
  FRAMES_CHANNEL,
  RECAP_CHANNEL,
  SCENE_CHANNEL,
  STATE_CHANNEL,
} from '../src/shared/wallpaper-bridge.ts';
import { BUILTIN, LEFT, RIGHT, SCENE, startStage } from './stage-fixture.ts';

const SCREENS = ['left', 'builtin', 'right'];

/** A window covering the MacBook's whole display, and one covering the whole right display. */
const OVER_BUILTIN: Rect = { x: 0, y: 0, w: 1728, h: 1117 };
const OVER_RIGHT: Rect = { x: 1728, y: 0, w: 2560, h: 1440 };

/**
 * Returns a deploy step of Tramlo.
 * @example
 * run.stage.send(deploy('failed')); // every window plays the failed deploy
 */
function deploy(step: 'started' | 'failed') {
  return sourceEventFixture({ id: `deploy-${step}`, kind: `deploy.${step}`, archetype: 'deploy', step });
}

describe('what the main process sends each wallpaper window', () => {
  test('an Event in the display language, to the windows in proportion to the wallpaper they show', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);
    run.host.setWindowFrames([OVER_BUILTIN]);

    for (let index = 0; index < 200; index += 1) run.stage.send(sourceEventFixture({ id: `pr-${index}` }));

    expect(run.played('builtin')).toEqual([]);
    expect(run.played('left').length + run.played('right').length).toBe(200);
    // 2560 x 1440 against 1920 x 1080: the right display shows 64 % of the visible wallpaper.
    expect(run.played('right').length / 200).toBeCloseTo(0.64, 1);
    expect(run.heard('right', EVENT_CHANNEL)[0]).toMatchObject({ label: 'Pull request merged' });
  });

  test('a deploy and a failed deploy to every window', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);

    run.stage.send(deploy('started'));
    run.stage.send(deploy('failed'));

    for (const id of SCREENS) expect(run.played(id)).toEqual(['deploy-started', 'deploy-failed']);
  });

  test('the same Gauges, counts, recent Events and last deploy to every window, before the Event plays', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);

    run.stage.setGauges({ crowd: 5 });
    run.stage.send(sourceEventFixture({ id: 'push', gauge: { role: 'daily', by: 3 } }));
    run.stage.send(deploy('failed'));

    for (const id of SCREENS) {
      expect(run.shared(id)).toMatchObject({
        gauges: { crowd: 5, daily: 3, build: 'error' },
        today: { roles: { approval: 1, deploy: 1 }, lastDeploy: { id: 'deploy-failed' } },
        recent: [{ id: 'deploy-failed' }, { id: 'push' }],
      });

      expect(run.on(id).sent.at(-1)?.channel).toBe(EVENT_CHANNEL);
    }
  });

  test('the current state and frames to the window of a display plugged in later', () => {
    const run = startStage([BUILTIN]);
    run.host.setWindowFrames([OVER_RIGHT]);
    run.stage.setGauges({ crowd: 5 });
    run.stage.send(sourceEventFixture({ id: 'push', gauge: { role: 'daily', by: 3 } }));

    run.host.setScreens([BUILTIN, RIGHT]);

    // Before anything else, so the page counts and hides like its neighbours from its first frame.
    expect(
      run
        .on('right')
        .sent.slice(0, 2)
        .map((message) => message.channel),
    ).toEqual([STATE_CHANNEL, FRAMES_CHANNEL]);
    expect(run.shared('right')).toEqual(run.shared('builtin'));
    expect(run.shared('right')).toMatchObject({ gauges: { crowd: 5, daily: 3 }, today: { roles: { approval: 1 } } });
    expect(run.heard('right', FRAMES_CHANNEL)).toEqual([[OVER_RIGHT]]);
  });

  test('the frames of what covers the wallpapers to every window, whenever they change', () => {
    const run = startStage([BUILTIN, RIGHT]);

    run.host.setWindowFrames([OVER_RIGHT]);

    expect(run.heard('builtin', FRAMES_CHANNEL)).toEqual([[], [OVER_RIGHT]]);
    expect(run.heard('right', FRAMES_CHANNEL)).toEqual([[], [OVER_RIGHT]]);
  });

  test('a new Theme or brand to every window, which keep their state', () => {
    const run = startStage([BUILTIN, RIGHT]);
    run.stage.send(sourceEventFixture());

    const next = { ...SCENE, theme: 'immeuble' } as const;
    run.stage.setScene(next);

    expect(run.opened.filter((port) => port.closed)).toEqual([]);
    expect(run.heard('builtin', SCENE_CHANNEL)).toEqual([next]);
    expect(run.heard('right', SCENE_CHANNEL)).toEqual([next]);
    expect(run.shared('right')).toMatchObject({ today: { roles: { approval: 1 } } });
  });

  test('a new language to the same windows, with the day’s tally started over and Events in that language', () => {
    const run = startStage([BUILTIN, RIGHT]);
    run.stage.send(sourceEventFixture({ id: 'before' }));

    const french = { ...SCENE, lang: 'fr' } as const;
    run.stage.setScene(french);
    run.stage.send(deploy('started'));

    expect(run.opened).toHaveLength(2);
    expect(run.opened.filter((port) => port.closed)).toEqual([]);

    for (const id of ['builtin', 'right']) {
      const channels = run.on(id).sent.map((message) => message.channel);

      // The empty state of the new engine comes before the scene that makes the page start over.
      expect(channels.slice(channels.lastIndexOf(SCENE_CHANNEL) - 2)).toEqual([
        STATE_CHANNEL,
        FRAMES_CHANNEL,
        SCENE_CHANNEL,
        STATE_CHANNEL,
        EVENT_CHANNEL,
      ]);
      expect(run.shared(id)).toMatchObject({ today: { roles: { deploy: 1 } }, recent: [{ id: 'deploy-started' }] });
      expect(run.heard(id, EVENT_CHANNEL).at(-1)).toMatchObject({ id: 'deploy-started', source: 'Tramlo' });
    }
  });
});

describe('a paused wallpaper', () => {
  test('counts as covered on every display, and changes nothing until it plays again', () => {
    const run = startStage([BUILTIN, RIGHT]);
    const before = SCREENS.slice(1).map((id) => run.on(id).sent.length);

    run.stage.setPaused(true);
    run.stage.setGauges({ crowd: 9 });
    run.stage.send(sourceEventFixture());
    run.host.setWindowFrames([OVER_RIGHT]);

    expect(run.heard('builtin', FRAMES_CHANNEL).at(-1)).toEqual([OVER_BUILTIN, OVER_RIGHT]);
    expect(SCREENS.slice(1).map((id) => run.on(id).sent.length)).toEqual(before.map((count) => count + 1));
  });

  test('plays what it held when it resumes soon', () => {
    const run = startStage([BUILTIN, RIGHT]);

    run.stage.setPaused(true);
    run.stage.send(sourceEventFixture({ id: 'held' }));
    run.host.clock.advance(30_000);
    run.stage.setPaused(false);

    expect([...run.played('builtin'), ...run.played('right')]).toEqual(['held']);
    expect(run.heard('builtin', FRAMES_CHANNEL).at(-1)).toEqual([]);
    expect(run.heard('builtin', RECAP_CHANNEL)).toEqual([]);
  });

  test('brings the recap to the most visible display when it resumes after a while', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);
    run.host.setWindowFrames([{ ...OVER_RIGHT, h: 720 }]);

    run.stage.setPaused(true);
    run.stage.send(sourceEventFixture({ id: 'pr-1' }));
    run.stage.send(sourceEventFixture({ id: 'pr-2' }));
    run.host.clock.advance(180_000);
    run.stage.setPaused(false);

    // Half of the right display is covered: the left one, 1920 x 1080, shows the most wallpaper.
    expect(run.heard('left', RECAP_CHANNEL)).toMatchObject([{ total: 2 }]);
    expect(run.heard('builtin', RECAP_CHANNEL)).toEqual([]);
    expect(run.heard('right', RECAP_CHANNEL)).toEqual([]);
    expect(SCREENS.flatMap((id) => run.played(id))).toEqual([]);
    expect(run.shared('right')).toMatchObject({ today: { roles: { approval: 2 } } });
  });

  test('freezes the window of a display plugged in during the pause', () => {
    const run = startStage([BUILTIN]);

    run.stage.setPaused(true);
    run.host.setScreens([BUILTIN, RIGHT]);

    expect(run.heard('right', FRAMES_CHANNEL)).toEqual([[OVER_BUILTIN, OVER_RIGHT]]);
  });
});
