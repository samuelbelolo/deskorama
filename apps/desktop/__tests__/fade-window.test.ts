import { createFakeClock, type FakeClock } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { fadeWindow, type FadingWindow } from '../src/main/fade-window.ts';
import { fadeWindowsOut } from '../src/main/fade-windows-out.ts';

/** A window that records every opacity it is given. */
interface FakeWindow extends FadingWindow {
  readonly opacities: number[];
  destroyed: boolean;
}

/**
 * Returns a window at `opacity` that records every opacity it is given.
 * @example
 * const window = fakeWindow(0);
 * window.setOpacity(0.5);
 * window.opacities; // [0.5]
 */
function fakeWindow(opacity: number): FakeWindow {
  const opacities: number[] = [];
  let current = opacity;

  const window: FakeWindow = {
    opacities,
    destroyed: false,
    getOpacity: () => current,
    setOpacity(next) {
      current = next;
      opacities.push(next);
    },
    isDestroyed: () => window.destroyed,
  };

  return window;
}

/**
 * Returns a host whose Clock a test steps, with motion reduced or not.
 * @example
 * const host = hostOn(createFakeClock());
 */
function hostOn(clock: FakeClock, reducedMotion = false): { clock: FakeClock; reducedMotion: boolean } {
  return { clock, reducedMotion };
}

describe('a window fading', () => {
  test('goes from transparent to opaque, never dimmer than the step before, then asks for no more frames', () => {
    const clock = createFakeClock();
    const window = fakeWindow(0);
    let done = 0;

    fadeWindow(window, hostOn(clock), { to: 1, ms: 400 }, () => (done += 1));

    expect(window.opacities).toEqual([0]);

    clock.advance(200);

    expect(window.getOpacity()).toBeGreaterThan(0.3);
    expect(window.getOpacity()).toBeLessThan(0.7);
    expect(done).toBe(0);

    clock.advance(1000);

    expect(window.getOpacity()).toBe(1);
    expect(window.opacities).toEqual(window.opacities.toSorted((a, b) => a - b));
    expect(done).toBe(1);

    const steps = window.opacities.length;
    clock.advance(1000);

    expect(window.opacities).toHaveLength(steps);
  });

  test('starts from the opacity the window has: a transparent window fading out never shows', () => {
    const clock = createFakeClock();
    const unseen = fakeWindow(0);
    const half = fakeWindow(0.4);

    fadeWindow(unseen, hostOn(clock), { to: 0, ms: 250 });
    fadeWindow(half, hostOn(clock), { to: 0, ms: 250 });
    clock.advance(1000);

    expect(Math.max(...unseen.opacities)).toBe(0);
    expect(Math.max(...half.opacities)).toBe(0.4);
    expect(half.getOpacity()).toBe(0);
  });

  test('lets a new fade take over from the one running, without ever going back up', () => {
    const clock = createFakeClock();
    const window = fakeWindow(0);

    fadeWindow(window, hostOn(clock), { to: 1, ms: 400 });
    clock.advance(100);

    const reached = window.getOpacity();
    const before = window.opacities.length;

    fadeWindow(window, hostOn(clock), { to: 0, ms: 250 });
    clock.advance(1000);

    const leaving = window.opacities.slice(before);

    expect(leaving[0]).toBe(reached);
    expect(leaving).toEqual(leaving.toSorted((a, b) => b - a));
    expect(window.getOpacity()).toBe(0);
  });

  test('never fades back in a window that started fading out, and still says it is done', () => {
    const clock = createFakeClock();
    const window = fakeWindow(1);
    let done = 0;

    fadeWindow(window, hostOn(clock), { to: 0, ms: 250 });
    clock.advance(100);
    fadeWindow(window, hostOn(clock), { to: 1, ms: 400 }, () => (done += 1));
    clock.advance(1000);

    expect(done).toBe(1);
    expect(window.getOpacity()).toBe(0);

    fadeWindow(window, hostOn(clock), { to: 1, ms: 400 });
    clock.advance(1000);

    expect(window.getOpacity()).toBe(0);
  });

  test('jumps to the end with reduced motion, and is done before it returns', () => {
    const window = fakeWindow(0);
    let done = 0;

    fadeWindow(window, hostOn(createFakeClock(), true), { to: 1, ms: 400 }, () => (done += 1));

    expect(window.opacities).toEqual([1]);
    expect(done).toBe(1);
  });

  test('leaves a window closed meanwhile alone, and still says it is done', () => {
    const clock = createFakeClock();
    const window = fakeWindow(0);
    let done = 0;

    fadeWindow(window, hostOn(clock), { to: 1, ms: 400 }, () => (done += 1));
    window.destroyed = true;
    clock.advance(1000);

    expect(window.opacities).toEqual([0]);
    expect(done).toBe(1);
  });
});

describe('the app leaving the desktop', () => {
  test('fades every window out, and only then says it may quit', () => {
    const clock = createFakeClock();
    const windows = [fakeWindow(1), fakeWindow(0.5)];
    let done = 0;

    fadeWindowsOut(windows, hostOn(clock), () => (done += 1));
    clock.advance(100);

    expect(done).toBe(0);

    clock.advance(200);

    expect(windows.map((window) => window.getOpacity())).toEqual([0, 0]);
    expect(done).toBe(1);
  });

  test('may quit at once when no window is open', () => {
    let done = 0;

    fadeWindowsOut([], hostOn(createFakeClock()), () => (done += 1));

    expect(done).toBe(1);
  });
});
