import { describe, expect, test } from 'vitest';
import { deskLeft } from '../src/desk-left.ts';
import { BUILTIN_SCREEN, demoScreens, EXTERNAL_SCREEN } from '../src/demo-screens.ts';
import { toDesktopFrames } from '../src/to-desktop-frames.ts';

describe('the demo’s screens', () => {
  test('pair a 16:10 MacBook with a 16:9 screen on its right', () => {
    expect(demoScreens(false).map((each) => each.screen)).toEqual([BUILTIN_SCREEN]);
    expect(demoScreens(true).map((each) => each.screen)).toEqual([BUILTIN_SCREEN, EXTERNAL_SCREEN]);
    expect(BUILTIN_SCREEN.width / BUILTIN_SCREEN.height).toBe(16 / 10);
    expect(EXTERNAL_SCREEN.width / EXTERNAL_SCREEN.height).toBe(16 / 9);
    expect(EXTERNAL_SCREEN.x).toBe(BUILTIN_SCREEN.x + BUILTIN_SCREEN.width);
  });

  test('report a screen’s windows in desktop coordinates', () => {
    expect(toDesktopFrames(EXTERNAL_SCREEN, [{ x: 60, y: 70, w: 760, h: 520 }])).toEqual([
      { x: 1500, y: 70, w: 760, h: 520 },
    ]);
  });

  test('cut a window dragged past the edge to its own screen, so it covers no neighbour', () => {
    expect(toDesktopFrames(BUILTIN_SCREEN, [{ x: 1360, y: 60, w: 620, h: 400 }])).toEqual([
      { x: 1360, y: 60, w: 80, h: 400 },
    ]);
    expect(toDesktopFrames(EXTERNAL_SCREEN, [{ x: -540, y: 60, w: 620, h: 400 }])).toEqual([
      { x: 1440, y: 60, w: 80, h: 400 },
    ]);
    expect(toDesktopFrames(BUILTIN_SCREEN, [{ x: 1500, y: 60, w: 100, h: 100 }])).toEqual([]);
  });

  test('stand side by side on the page with a bezel between them', () => {
    expect(deskLeft(BUILTIN_SCREEN, 0)).toBe(0);
    expect(deskLeft(EXTERNAL_SCREEN, 1)).toBe(1440 + 48);
  });
});
