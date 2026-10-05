import type { Rect } from '@deskorama/core';
import { createFakeClock, FIXTURE_TIME } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import type { DisplayArea } from '../src/main/window-frames/display-area.ts';
import { systemFrames } from '../src/main/window-frames/system-frames.ts';
import {
  COVERED_EVERY_MS,
  VISIBLE_EVERY_MS,
  watchWindowFrames,
} from '../src/main/window-frames/watch-window-frames.ts';
import { settle } from './settle.ts';

/** A 14-inch MacBook Pro display: a 33-point menu bar and a 70-point Dock. */
const BUILTIN: DisplayArea = {
  id: 1,
  bounds: { x: 0, y: 0, width: 1728, height: 1117 },
  workArea: { x: 0, y: 33, width: 1728, height: 1014 },
};

const MENU_BAR = { x: 0, y: 0, w: 1728, h: 33 };
const DOCK = { x: 0, y: 1047, w: 1728, h: 70 };
const EDITOR = { x: 0, y: 33, w: 900, h: 1014 };
const MAXIMISED = { x: 0, y: 33, w: 1728, h: 1014 };

/**
 * Starts a frame watch over the built-in display whose windows a test sets, and returns the frames it sent, the
 * number of reads, and the Clock.
 * @example
 * const watch = await startWatch([EDITOR]);
 */
async function startWatch(initial: readonly Rect[]) {
  const clock = createFakeClock(FIXTURE_TIME);
  const sent: (readonly Rect[])[] = [];
  let windows = initial;
  let displays: readonly DisplayArea[] = [BUILTIN];
  let reads = 0;

  const watch = watchWindowFrames({
    clock,
    displays: () => displays,
    readWindows: async () => {
      reads += 1;

      return windows;
    },
    onFrames: (frames) => sent.push(frames),
  });

  await settle();

  const step = async (ms: number): Promise<void> => {
    clock.advance(ms);
    await settle();
  };

  return {
    watch,
    sent,
    reads: () => reads,
    setWindows: (next: readonly Rect[]) => void (windows = next),
    setDisplays: (next: readonly DisplayArea[]) => void (displays = next),
    step,
  };
}

describe('the frame watch', () => {
  test('counts the menu bar and the Dock as covering the wallpaper', () => {
    expect(systemFrames([BUILTIN])).toEqual([MENU_BAR, DOCK]);
  });

  test('sends the frames at once, then only when a window moves', async () => {
    const run = await startWatch([EDITOR]);

    expect(run.sent).toEqual([[MENU_BAR, DOCK, EDITOR]]);

    await run.step(VISIBLE_EVERY_MS);
    expect(run.sent).toHaveLength(1);

    run.setWindows([]);
    await run.step(VISIBLE_EVERY_MS);
    expect(run.sent.at(-1)).toEqual([MENU_BAR, DOCK]);
  });

  test('reads less often while every wallpaper is covered', async () => {
    const run = await startWatch([MAXIMISED]);

    await run.step(VISIBLE_EVERY_MS);
    expect(run.reads()).toBe(1);

    await run.step(COVERED_EVERY_MS - VISIBLE_EVERY_MS);
    expect(run.reads()).toBe(2);
  });

  test('stops reading while paused and starts again on resume', async () => {
    const run = await startWatch([EDITOR]);

    run.watch.pause();
    await run.step(10 * COVERED_EVERY_MS);
    expect(run.reads()).toBe(1);

    run.watch.resume();
    await settle();
    expect(run.reads()).toBe(2);
  });

  test('follows the displays: a screen plugged in brings its menu bar, at once when asked to read again', async () => {
    const external: DisplayArea = {
      id: 2,
      bounds: { x: 1728, y: 0, width: 2560, height: 1440 },
      workArea: { x: 1728, y: 25, width: 2560, height: 1415 },
    };
    const run = await startWatch([]);

    run.setDisplays([BUILTIN, external]);
    run.watch.refresh();
    await settle();

    expect(run.reads()).toBe(2);
    expect(run.sent.at(-1)).toEqual([MENU_BAR, DOCK, { x: 1728, y: 0, w: 2560, h: 25 }]);

    run.setDisplays([BUILTIN]);
    await run.step(VISIBLE_EVERY_MS);

    expect(run.reads()).toBe(3);
    expect(run.sent.at(-1)).toEqual([MENU_BAR, DOCK]);
  });

  test('does not start reading again when asked while paused', async () => {
    const run = await startWatch([]);

    run.watch.pause();
    run.watch.refresh();
    await run.step(10 * COVERED_EVERY_MS);

    expect(run.reads()).toBe(1);
  });

  test('ignores a window that is exactly a whole display, an invisible overlay of macOS', async () => {
    const overlay = { x: 0, y: 0, w: 1728, h: 1117 };
    const run = await startWatch([overlay, EDITOR]);

    expect(run.sent).toEqual([[MENU_BAR, DOCK, EDITOR]]);
  });
});
