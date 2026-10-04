import type { Cancel, Clock, Random } from '@deskorama/core';

/** Follow-ups of a bursty kind, as errors come: a few more within minutes of the first. */
export interface Bursts {
  /** Maybe schedules a few more of the same kind after one has happened. */
  after(kind: string): void;
  readonly stop: Cancel;
}

/** How often a bursty Event brings more. */
const BURST_CHANCE = 0.35;

/**
 * Returns the bursts of a fictional Source: after a bursty Event, about one time in three, two to five more of the
 * same kind follow, each 20 to 110 seconds of activity apart, shortened by the speed.
 * @example
 * const bursts = createBursts({ clock, random, speed: () => 10, emit: (kind) => send(kind) });
 * bursts.after('ci.failed'); // sometimes, a few more 'ci.failed' within the next minutes
 */
export function createBursts(options: {
  readonly clock: Clock;
  readonly random: Random;
  readonly speed: () => number;
  readonly emit: (kind: string) => void;
}): Bursts {
  const { clock, random, speed, emit } = options;
  const pending = new Set<Cancel>();

  return {
    after(kind) {
      if (random.next() >= BURST_CHANCE) return;

      const extra = 2 + Math.floor(random.next() * 4);
      let delay = 0;

      for (let index = 0; index < extra; index += 1) {
        delay += (20_000 + random.next() * 90_000) / speed();

        const cancel = clock.after(delay, () => {
          pending.delete(cancel);
          emit(kind);
        });
        pending.add(cancel);
      }
    },
    stop() {
      for (const cancel of pending) cancel();
      pending.clear();
    },
  };
}
