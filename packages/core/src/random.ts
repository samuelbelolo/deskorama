/** A seeded random generator: the same seed always gives the same sequence. */
export interface Random {
  /** The next number, at least 0 and below 1. */
  next(): number;
}

/**
 * Returns a seeded random generator (mulberry32). Nothing reads `Math.random`, so every draw is a
 * function of the seed.
 * @example
 * const random = createRandom(42);
 * random.next(); // 0.6011037519201636, the same on every run
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), state | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    },
  };
}
