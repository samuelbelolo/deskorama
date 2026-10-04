import type { Rarity } from '@deskorama/core';
import type { StageSize } from './stage-for.ts';

/**
 * Returns the stage sizes of a Gag: rarity is size, so a common Event plays in one bay pair and a notable one in
 * three; a picture wider than 43 native pixels asks for a 240 px stage first and draws compactly in 180.
 * @example
 * stageSizes('common', 30); // [[120, 120]]
 * stageSizes('notable', 52); // [[240, 120], [180, 120]]
 */
export function stageSizes(rarity: Rarity, wide = 0): readonly StageSize[] {
  if (wide > 43)
    return [
      [240, 120],
      [180, 120],
    ];
  if (wide > 28 || rarity !== 'common') return [[180, 120]];

  return [[120, 120]];
}
