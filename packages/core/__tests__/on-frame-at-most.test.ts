import { describe, expect, test } from 'vitest';
import type { Clock } from '../src/clock.ts';
import { onFrameAtMost } from '../src/on-frame-at-most.ts';

/** A Clock whose display frames a test fires by hand, and the number of frame listeners still subscribed. */
interface FrameClock extends Clock {
  /** Fires one display frame at `now` on every subscribed listener. */
  frame(now: number): void;
  subscribed(): number;
}

// Core cannot depend on test-utils (test-utils depends on core), so this test builds its own frame Clock.
/**
 * Returns a Clock that only fires frames when the test calls `frame`.
 * @example
 * const clock = frameClock();
 * clock.frame(16);
 */
function frameClock(): FrameClock {
  const listeners = new Set<(now: number) => void>();
  return {
    now: () => 0,
    after: () => () => {},
    onFrame(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    frame(now) {
      for (const listener of listeners) listener(now);
    },
    subscribed: () => listeners.size,
  };
}

/**
 * Returns how many draws a 30 fps cap lets through during one second of frames at `hz`.
 * @example
 * drawsInOneSecond(120); // 30
 */
function drawsInOneSecond(hz: number): number {
  const clock = frameClock();
  let draws = 0;
  onFrameAtMost(clock, 30, () => draws++);
  for (let frame = 1; frame <= hz; frame++) clock.frame((frame * 1000) / hz);
  return draws;
}

describe('a frame-rate cap', () => {
  test('draws 30 times per second at 30 fps on 60 Hz and 120 Hz screens', () => {
    expect(drawsInOneSecond(60)).toBe(30);
    expect(drawsInOneSecond(120)).toBe(30);
  });

  test('draws every other frame of the fake Clock, whose frames are 16 ms apart', () => {
    const clock = frameClock();
    const drawn: number[] = [];
    onFrameAtMost(clock, 30, (now) => drawn.push(now));
    for (const now of [16, 32, 48, 64, 80]) clock.frame(now);
    expect(drawn).toEqual([16, 48, 80]);
  });

  test('never draws faster than the display', () => {
    expect(drawsInOneSecond(24)).toBe(24);
  });

  test('stops listening to frames once cancelled', () => {
    const clock = frameClock();
    const stop = onFrameAtMost(clock, 30, () => {});
    expect(clock.subscribed()).toBe(1);
    stop();
    expect(clock.subscribed()).toBe(0);
  });
});
