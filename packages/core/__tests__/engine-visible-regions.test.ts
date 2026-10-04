import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import type { Screen } from '../src/screen.ts';
import { BUILTIN, createManualHost } from './manual-host.ts';
import { mountedHost, recordingTheme } from './recording-theme.ts';
import { TRAMLO } from './tramlo.ts';

const WHOLE_SCREEN = { x: 0, y: 0, w: 1440, h: 900 };

/**
 * Mounts a recording Theme through an engine on a manual host, and returns both hosts and the unmount.
 * @example
 * const { platform, host } = mounted();
 * platform.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);
 */
function mounted(screens: readonly Screen[] = [BUILTIN]) {
  const { theme, recording } = recordingTheme();
  const platform = createManualHost({ screens });
  const unmount = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO }).mount(theme, 'layer');
  return { platform, host: mountedHost(recording), unmount };
}

describe('the visible regions a Theme receives', () => {
  test('follow the window frames and tell the Theme when they change', () => {
    const { platform, host } = mounted();
    const heard: number[] = [];
    host.onVisibility((fraction) => heard.push(fraction));
    expect(host.visibleFraction()).toBe(1);
    platform.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);
    expect(host.visibleFraction()).toBe(0.5);
    expect(heard).toEqual([0.5]);
    const spot = host.freeSpot({ w: 200, h: 120 });
    expect(spot?.x).toBeGreaterThanOrEqual(720);
  });

  test('start from the frames the platform already reports', () => {
    const platform = createManualHost();
    platform.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);
    const { theme, recording } = recordingTheme();
    createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO }).mount(theme, 'layer');
    expect(mountedHost(recording).visibleFraction()).toBe(0.5);
  });

  test('read frames in desktop coordinates, on a screen right of the first one', () => {
    const external: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };
    const { platform, host } = mounted([external]);
    platform.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    expect(host.visibleFraction()).toBe(1);
    platform.setWindowFrames([{ x: 1440, y: 0, w: 1600, h: 900 }]);
    expect(host.isHidden()).toBe(true);
  });

  test('report a fully covered screen hidden, and stop its frames until it shows again', () => {
    const { platform, host } = mounted();
    const frames: number[] = [];
    host.clock.onFrame((now) => frames.push(now));
    platform.frame();
    platform.setWindowFrames([WHOLE_SCREEN]);
    expect(host.isHidden()).toBe(true);
    expect(platform.frameSubscriptions()).toBe(0);
    platform.frame();
    platform.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 840 }]);
    expect(host.isHidden()).toBe(false);
    platform.frame();
    expect(frames).toHaveLength(2);
  });

  test('let timers fire while hidden, so a Gag that was playing still ends', () => {
    const { platform, host } = mounted();
    let ended = false;
    host.clock.after(1000, () => {
      ended = true;
    });
    platform.setWindowFrames([WHOLE_SCREEN]);
    platform.advance(1000);
    expect(ended).toBe(true);
  });

  test('stop following the windows, frames and timers once the Theme is unmounted', () => {
    const { platform, host, unmount } = mounted();
    let fired = false;
    host.clock.onFrame(() => {});
    host.clock.after(1000, () => {
      fired = true;
    });
    unmount();
    platform.advance(2000);
    expect(fired).toBe(false);
    expect(platform.frameSubscriptions()).toBe(0);
    expect(platform.frameFollowers()).toBe(0);
  });
});
