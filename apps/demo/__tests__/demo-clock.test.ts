import { describe, expect, test } from 'vitest';
import { createDemoClock } from '../src/create-demo-clock.ts';
import { createManualClock } from './manual-clock.ts';

describe('the demo’s Clock', () => {
  test('moves to the hour the visitor picks, on the same day, and keeps running from there', () => {
    const real = createManualClock(new Date(2026, 9, 4, 14, 37).getTime());
    const demo = createDemoClock(real);

    demo.setHour(22);
    expect(demo.clock.now()).toBe(new Date(2026, 9, 4, 22).getTime());

    real.advance(90_000);
    expect(demo.clock.now()).toBe(new Date(2026, 9, 4, 22, 1, 30).getTime());

    demo.setHour(3);
    expect(demo.clock.now()).toBe(new Date(2026, 9, 4, 3).getTime());
  });

  test('keeps the real pace for timers, so a Gag lasts as long at any hour', () => {
    const real = createManualClock(new Date(2026, 9, 4, 14).getTime());
    const demo = createDemoClock(real);
    demo.setHour(3);

    let done = false;
    demo.clock.after(2500, () => (done = true));
    real.advance(2499);
    expect(done).toBe(false);
    real.advance(1);
    expect(done).toBe(true);
  });
});
