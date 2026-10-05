import { sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { EVENT_CHANNEL, SCREENS_CHANNEL } from '../src/shared/wallpaper-bridge.ts';
import { BUILTIN, LEFT, RIGHT, startStage } from './stage-fixture.ts';

describe('the wallpaper windows while displays come and go', () => {
  test('close the window of a display that is unplugged, and leave the others alone', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);

    run.host.setScreens([BUILTIN]);

    expect(run.opened.map((port) => [port.setup.screen.id, port.closed])).toEqual([
      ['left', true],
      ['builtin', false],
      ['right', true],
    ]);
  });

  test('open a window for a display that is plugged in', () => {
    const run = startStage([BUILTIN]);

    run.host.setScreens([BUILTIN, RIGHT]);

    expect(run.on('right').setup.screen).toEqual(RIGHT);
    expect(run.opened).toHaveLength(2);
  });

  test('tell every page its neighbours and where they are, as it opens and whenever they change', () => {
    const run = startStage([BUILTIN, RIGHT]);

    expect(run.on('right').setup.screens).toEqual([BUILTIN, RIGHT]);

    run.host.setScreens([LEFT, BUILTIN, RIGHT]);

    expect(run.on('left').setup.screens).toEqual([LEFT, BUILTIN, RIGHT]);
    expect(run.heard('builtin', SCREENS_CHANNEL)).toEqual([[LEFT, BUILTIN, RIGHT]]);
    expect(run.heard('right', SCREENS_CHANNEL)).toEqual([[LEFT, BUILTIN, RIGHT]]);
  });

  test('open a fresh window at the new size when a display is resized, and close the old one', () => {
    const run = startStage([BUILTIN, RIGHT]);
    const before = run.on('right');
    const resized = { ...RIGHT, width: 1920, height: 1080 };

    run.host.setScreens([BUILTIN, resized]);

    expect(before.closed).toBe(true);
    expect(run.on('right').setup.screen).toEqual(resized);
    expect(run.on('builtin')).toBe(run.opened[0]);
  });

  test('send an Event to exactly one window out of three', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);

    run.stage.send(sourceEventFixture());

    const played = ['left', 'builtin', 'right'].map((id) => run.heard(id, EVENT_CHANNEL).length);

    expect(played.toSorted((a, b) => a - b)).toEqual([0, 0, 1]);
  });

  test('send nothing more to the window of a display that left, and route to the one that arrived', () => {
    const run = startStage([LEFT, BUILTIN]);
    const left = run.on('left');
    const before = left.sent.length;

    run.host.setScreens([BUILTIN, RIGHT]);

    for (let index = 0; index < 60; index += 1) run.stage.send(sourceEventFixture({ id: `pr-${index}` }));

    expect(left.sent).toHaveLength(before);
    expect(run.heard('builtin', EVENT_CHANNEL).length + run.heard('right', EVENT_CHANNEL).length).toBe(60);
    expect(run.heard('right', EVENT_CHANNEL).length).toBeGreaterThan(20);
  });

  test('close every window when the app stops', () => {
    const run = startStage([LEFT, BUILTIN, RIGHT]);

    run.stage.stop();

    expect(run.opened.every((port) => port.closed)).toBe(true);
  });
});
