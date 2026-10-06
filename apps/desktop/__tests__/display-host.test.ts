import type { Screen } from '@deskorama/core';
import { createFakeClock } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createDisplayHost } from '../src/main/wallpapers/create-display-host.ts';
import type { DisplayArea } from '../src/main/window-frames/display-area.ts';

/** The MacBook's own display, with its menu bar and its Dock. */
const BUILTIN: DisplayArea = {
  id: 1,
  bounds: { x: 0, y: 0, width: 1728, height: 1117 },
  workArea: { x: 0, y: 33, width: 1728, height: 1014 },
};

/** A 1080p display left of the MacBook. */
const LEFT: DisplayArea = {
  id: 2,
  bounds: { x: -1920, y: 0, width: 1920, height: 1080 },
  workArea: { x: -1920, y: 25, width: 1920, height: 1055 },
};

/** A 1440p display right of the MacBook, set higher. */
const RIGHT: DisplayArea = {
  id: 3,
  bounds: { x: 1728, y: -323, width: 2560, height: 1440 },
  workArea: { x: 1728, y: -298, width: 2560, height: 1415 },
};

/**
 * Starts a Host over displays a test plugs and unplugs, and keeps every arrangement it tells.
 * @example
 * const run = startHost([BUILTIN]);
 * run.plug([BUILTIN, RIGHT]);
 * run.heard; // [["1", "3"]]
 */
function startHost(initial: readonly DisplayArea[]) {
  const listeners = new Set<() => void>();
  const heard: string[][] = [];
  let displays = initial;

  const host = createDisplayHost({
    displays: {
      all: () => displays,
      onChange(listener) {
        listeners.add(listener);

        return () => void listeners.delete(listener);
      },
    },
    clock: createFakeClock(),
    reducedMotion: false,
  });

  host.onScreens((screens: readonly Screen[]) => heard.push(screens.map((screen) => screen.id)));

  /** Changes the displays, as macOS does when one is plugged in, unplugged, moved or resized. */
  const plug = (next: readonly DisplayArea[]): void => {
    displays = next;

    for (const listener of Array.from(listeners)) listener();
  };

  return { host, heard, plug, followers: () => listeners.size };
}

describe('the displays as the engine sees them', () => {
  test('are the Mac’s displays, left to right, whole areas with the menu bar included', () => {
    const { host } = startHost([BUILTIN, RIGHT, LEFT]);

    expect(host.screens()).toEqual([
      { id: '2', x: -1920, y: 0, width: 1920, height: 1080 },
      { id: '1', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 70 },
      { id: '3', x: 1728, y: -323, width: 2560, height: 1440 },
    ]);
  });

  test('follow a display plugged in, unplugged, resized and moved', () => {
    const run = startHost([BUILTIN]);

    run.plug([BUILTIN, RIGHT]);
    run.plug([BUILTIN]);
    run.plug([{ ...BUILTIN, bounds: { ...BUILTIN.bounds, width: 1512, height: 982 } }]);
    run.plug([
      { ...BUILTIN, bounds: { ...BUILTIN.bounds, x: 1920 } },
      { ...LEFT, bounds: { ...LEFT.bounds, x: 0 } },
    ]);

    expect(run.heard).toEqual([['1', '3'], ['1'], ['1'], ['2', '1']]);
    expect(run.host.screens().map((screen) => [screen.id, screen.x, screen.width])).toEqual([
      ['2', 0, 1920],
      ['1', 1920, 1728],
    ]);
  });

  test('stay quiet when only a menu bar changed', () => {
    const run = startHost([BUILTIN, RIGHT]);

    run.plug([{ ...BUILTIN, workArea: { x: 0, y: 25, width: 1728, height: 1022 } }, RIGHT]);

    expect(run.heard).toEqual([]);
  });

  test('follow a Dock that grows or hides along a bottom edge, since the scene stands above it', () => {
    const run = startHost([BUILTIN, RIGHT]);

    run.plug([{ ...BUILTIN, workArea: { x: 0, y: 33, width: 1728, height: 994 } }, RIGHT]);
    run.plug([{ ...BUILTIN, workArea: { x: 0, y: 33, width: 1728, height: 1084 } }, RIGHT]);

    expect(run.heard).toEqual([
      ['1', '3'],
      ['1', '3'],
    ]);
    expect(run.host.screens().map((screen) => screen.bottomInset)).toEqual([undefined, undefined]);
  });

  test('report the window frames they are given', () => {
    const { host } = startHost([BUILTIN]);
    const heard: number[] = [];
    host.onWindowFrames((frames) => heard.push(frames.length));

    host.setWindowFrames([{ x: 0, y: 0, w: 1728, h: 33 }]);

    expect(host.windowFrames()).toEqual([{ x: 0, y: 0, w: 1728, h: 33 }]);
    expect(heard).toEqual([1]);
  });

  test('stop following the displays once stopped', () => {
    const run = startHost([BUILTIN]);

    run.host.stop();

    expect(run.followers()).toBe(0);
  });
});
