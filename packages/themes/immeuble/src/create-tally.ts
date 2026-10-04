import type { ScreenHost } from '@deskorama/core';

/** Today's count of intruders kept out, as the host keeps it for every screen. */
export interface Tally {
  count(): number;
  /** Reads the host's count again; true when it changed since the last read. */
  changed(): boolean;
}

/**
 * Returns today's tally of intruders kept out, read from the host, which counts them on every screen and resets them
 * at midnight.
 * @example
 * const tally = createTally(host);
 * if (tally.changed()) redrawHallSign(tally.count());
 */
export function createTally(host: ScreenHost): Tally {
  let count = host.today().roles.blocked ?? 0;

  return {
    count: () => count,
    changed() {
      const today = host.today().roles.blocked ?? 0;
      if (today === count) return false;

      count = today;
      return true;
    },
  };
}
