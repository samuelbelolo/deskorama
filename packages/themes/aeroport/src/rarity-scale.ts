import type { Rarity } from '@deskorama/core';

/** How much bigger a Gag's props are for a rarer Event, so rarity reads at a glance. */
const SCALE: Readonly<Record<Rarity, number>> = { common: 1, notable: 1.3, rare: 1.6, jackpot: 1.8 };

/**
 * Returns the size factor of a Gag's props for an Event of this rarity.
 * @example
 * rarityScale('rare'); // 1.6
 */
export function rarityScale(rarity: Rarity): number {
  return SCALE[rarity];
}
