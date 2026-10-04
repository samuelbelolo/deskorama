import type { Cancel, Clock, WallpaperEvent } from '@deskorama/core';

/** Events kept waiting for room; beyond this, the oldest is dropped. */
const MAX_WAITING = 12;

/** How long an Event may wait for room before it is dropped. */
const WAIT_TTL_MS = 120_000;

/** How often the waiting Events look for room again. */
const RETRY_MS = 1500;

/** The Events of one screen that found no room yet. */
export interface WaitingLine {
  /** Keeps an Event waiting. */
  add(event: WallpaperEvent): void;
  /** Lets every waiting Event try again, oldest first; those that still find no room keep waiting. */
  retry(): void;
  dispose(): void;
}

/**
 * Returns the waiting line of one screen: each Event tries `start` again every 1.5 s and whenever `retry` is
 * called, until it plays or has waited two minutes.
 * @example
 * const waiting = createWaitingLine(clock, (event) => start(event));
 * waiting.add(event); // tried again in 1.5 s
 */
export function createWaitingLine(clock: Clock, start: (event: WallpaperEvent) => boolean): WaitingLine {
  let waiting: { readonly event: WallpaperEvent; readonly at: number }[] = [];
  let timer: Cancel | null = null;

  const schedule = (): void => {
    if (timer !== null || waiting.length === 0) return;
    timer = clock.after(RETRY_MS, () => {
      timer = null;
      retry();
    });
  };

  const retry = (): void => {
    const now = clock.now();
    const due = waiting.filter((item) => now - item.at < WAIT_TTL_MS);
    waiting = [];
    for (const item of due) if (!start(item.event)) waiting.push(item);
    schedule();
  };

  return {
    add(event) {
      waiting.push({ event, at: clock.now() });
      if (waiting.length > MAX_WAITING) waiting.shift();
      schedule();
    },
    retry,
    dispose() {
      timer?.();
      timer = null;
      waiting = [];
    },
  };
}
