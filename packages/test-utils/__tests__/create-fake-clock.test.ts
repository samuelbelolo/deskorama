import { describe, expect, test } from 'vitest';
import { createFakeClock, FRAME_MS } from '../src/create-fake-clock.ts';

describe('the fake Clock', () => {
  test('stands still until a test steps it', () => {
    const clock = createFakeClock(1000);
    expect(clock.now()).toBe(1000);
    clock.advance(250);
    expect(clock.now()).toBe(1250);
  });

  test('fires timers at their due time, in time order', () => {
    const clock = createFakeClock();
    const seen: string[] = [];
    clock.after(300, () => seen.push(`late at ${clock.now()}`));
    clock.after(100, () => seen.push(`early at ${clock.now()}`));
    clock.advance(200);
    expect(seen).toEqual(['early at 100']);
    clock.advance(200);
    expect(seen).toEqual(['early at 100', 'late at 300']);
  });

  test('fires a timer scheduled by another timer within the same step', () => {
    const clock = createFakeClock();
    const seen: number[] = [];
    clock.after(100, () => clock.after(50, () => seen.push(clock.now())));
    clock.advance(1000);
    expect(seen).toEqual([150]);
  });

  test('never fires a cancelled timer', () => {
    const clock = createFakeClock();
    let fired = false;
    const cancel = clock.after(100, () => {
      fired = true;
    });
    cancel();
    clock.advance(1000);
    expect(fired).toBe(false);
  });

  test('calls frame listeners once per frame with the current time', () => {
    const clock = createFakeClock();
    const frames: number[] = [];
    const cancel = clock.onFrame((now) => frames.push(now));
    clock.advance(FRAME_MS * 3);
    cancel();
    clock.advance(FRAME_MS * 3);
    expect(frames).toEqual([FRAME_MS, FRAME_MS * 2, FRAME_MS * 3]);
  });
});
