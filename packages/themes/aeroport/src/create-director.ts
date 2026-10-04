import type { Cancel, WallpaperEvent } from '@deskorama/core';
import { gagFor } from './gag-for.ts';
import type { Stage } from './stage.ts';

/** Events kept waiting while a Gag plays; beyond this, the oldest waiting Event is dropped. */
const MAX_WAITING = 8;

/** Plays one Gag at a time on one screen. */
export interface Director {
  /** Plays the Gag of `event` now, or after the Gags already waiting. */
  play(event: WallpaperEvent): void;
  /** Stops the running Gag and forgets the waiting Events. */
  dispose(): void;
}

/**
 * Returns the director of one screen: Events play one after another, so two Gags never overlap; each Gag finds and
 * holds its own visible room.
 * @example
 * const director = createDirector(stage);
 * host.onEvent((event) => director.play(event));
 */
export function createDirector(stage: Stage): Director {
  const waiting: WallpaperEvent[] = [];
  let running: Cancel | null = null;

  const next = (): void => {
    running = null;
    const event = waiting.shift();
    if (event !== undefined) running = gagFor(event)(stage, event, next);
  };

  return {
    play(event) {
      waiting.push(event);
      if (waiting.length > MAX_WAITING) waiting.shift();
      if (running === null) next();
    },
    dispose() {
      waiting.length = 0;
      running?.();
      running = null;
    },
  };
}
