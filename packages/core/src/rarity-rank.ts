import { RARITIES, type Rarity } from './rarity.ts';

/**
 * Returns how rare a rarity is, from 0 for `common` to 3 for `jackpot`, so rarities compare as numbers.
 * @example
 * rarityRank('common'); // 0
 * rarityRank('jackpot'); // 3
 */
export function rarityRank(rarity: Rarity): number {
  return RARITIES.indexOf(rarity);
}
