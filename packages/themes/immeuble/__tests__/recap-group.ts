import type { Archetype, Rarity, RecapGroup } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';

/**
 * Returns a recap group: `count` missed Events of one Role.
 * @example
 * group('error', 'common', 2).count; // 2
 */
export function group(archetype: Archetype | null, rarity: Rarity, count: number): RecapGroup {
  return { archetype, rarity, count, latest: wallpaperEventFixture('fr', { id: `${archetype}`, archetype, rarity }) };
}
