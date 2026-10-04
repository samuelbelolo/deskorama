import { createVisibleMap, createRandom, type Screen } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { clampWindow } from '../src/clamp-window.ts';
import { BUILTIN_SCREEN, EXTERNAL_SCREEN } from '../src/demo-screens.ts';
import {
  BUILTIN_DESKTOP,
  DESKTOP_WINDOWS,
  DOCK,
  EXTERNAL_DESKTOP,
  type DesktopLayout,
} from '../src/desktop-layouts.ts';
import { desktopOccluders } from '../src/desktop-occluders.ts';

const stillClock = { now: () => 0, after: () => () => {}, onFrame: () => () => {} };

/**
 * Returns whether a screen is fully hidden by its desktop, with or without the meeting window shown.
 * @example
 * hiddenBy(BUILTIN_SCREEN, BUILTIN_DESKTOP, true); // true
 */
function hiddenBy(screen: Screen, layout: DesktopLayout, covered: boolean): boolean {
  const map = createVisibleMap({ ...screen, x: 0 }, stillClock, createRandom(1));
  map.update(desktopOccluders(screen, layout, layout.windows, covered));
  return map.isHidden();
}

describe('the fake desktop', () => {
  test('reports the menu bar, the Dock and the windows as covering the wallpaper', () => {
    const frames = desktopOccluders(BUILTIN_SCREEN, BUILTIN_DESKTOP, DESKTOP_WINDOWS, false);

    expect(frames.slice(0, 2)).toEqual([{ x: 0, y: 0, w: 1440, h: 25 }, DOCK]);
    expect(frames).toHaveLength(2 + DESKTOP_WINDOWS.length);
  });

  test('gives the external screen a menu bar across its width and no Dock', () => {
    const frames = desktopOccluders(EXTERNAL_SCREEN, EXTERNAL_DESKTOP, EXTERNAL_DESKTOP.windows, false);

    expect(frames[0]).toEqual({ x: 0, y: 0, w: 1600, h: 25 });
    expect(frames).toHaveLength(1 + 1);
  });

  test('leaves part of each wallpaper visible at first, and hides all of it with the meeting window', () => {
    expect(hiddenBy(BUILTIN_SCREEN, BUILTIN_DESKTOP, false)).toBe(false);
    expect(hiddenBy(BUILTIN_SCREEN, BUILTIN_DESKTOP, true)).toBe(true);
    expect(hiddenBy(EXTERNAL_SCREEN, EXTERNAL_DESKTOP, false)).toBe(false);
    expect(hiddenBy(EXTERNAL_SCREEN, EXTERNAL_DESKTOP, true)).toBe(true);
  });

  test('keeps a dragged window under the menu bar with its title bar on screen', () => {
    const size = { w: 620, h: 400 };

    expect(clampWindow({ x: -900, y: 0 }, size, BUILTIN_SCREEN)).toEqual({ x: -540, y: 25 });
    expect(clampWindow({ x: 2000, y: 2000 }, size, BUILTIN_SCREEN)).toEqual({ x: 1360, y: 872 });
    expect(clampWindow({ x: 300.4, y: 200.6 }, size, BUILTIN_SCREEN)).toEqual({ x: 300, y: 201 });
  });
});
