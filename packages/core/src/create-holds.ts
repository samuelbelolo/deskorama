import type { Cancel, Clock } from './clock.ts';
import { markBlock } from './mark-block.ts';
import type { Grid, TileBlock } from './tile-block.ts';

/** Blocks of tiles that Gags hold for a while, or that signs reserve until released. */
export interface Holds {
  /** Holds `block` until the Clock reaches `until` (Infinity: until released); returns what releases it early. */
  add(block: TileBlock, until: number): Cancel;
  /** Sets every tile still held to 1 in the grid mask. */
  markInto(mask: Uint8Array, grid: Grid): void;
}

/**
 * Returns an empty set of holds. A hold expires on the injected Clock, never on the system time.
 * @example
 * const holds = createHolds(clock);
 * const release = holds.add({ col: 3, row: 4, cols: 2, rows: 2 }, clock.now() + 4000);
 * release(); // the block is free again before the 4 s are up
 */
export function createHolds(clock: Clock): Holds {
  let held: { readonly block: TileBlock; readonly until: number }[] = [];

  return {
    add(block, until) {
      const entry = { block, until };
      held.push(entry);

      return () => {
        held = held.filter((other) => other !== entry);
      };
    },

    markInto(mask, grid) {
      const now = clock.now();
      held = held.filter((entry) => entry.until > now);

      for (const { block } of held) markBlock(mask, grid, block);
    },
  };
}
