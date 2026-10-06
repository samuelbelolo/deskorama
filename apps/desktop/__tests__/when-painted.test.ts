import { createFakeClock, FRAME_MS } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { whenPainted } from '../src/renderer/when-painted.ts';

describe('a page waiting for its scene to reach the screen', () => {
  test('says so after two display frames, once', () => {
    const clock = createFakeClock();
    let said = 0;

    whenPainted(clock, () => (said += 1));
    clock.advance(FRAME_MS);

    expect(said).toBe(0);

    clock.advance(FRAME_MS);

    expect(said).toBe(1);

    clock.advance(1000);

    expect(said).toBe(1);
  });

  test('says so after a quarter of a second when the display gives no frame', () => {
    const timers = createFakeClock();
    let said = 0;

    // A covered window: its timers run, its display frames do not.
    const covered = {
      now: () => timers.now(),
      after: (ms: number, task: () => void) => timers.after(ms, task),
      onFrame: () => () => {},
    };

    whenPainted(covered, () => (said += 1));
    timers.advance(249);

    expect(said).toBe(0);

    timers.advance(1);

    expect(said).toBe(1);
  });
});
