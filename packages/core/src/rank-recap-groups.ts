import { rarityRank } from './rarity-rank.ts';
import type { RecapGroup } from './recap.ts';

/** How many Roles a recap lists before its "and N more" line. */
const RECAP_GROUPS = 6;

/**
 * Returns the groups a recap lists, rarest first, then the most frequent, then in the order they first came, cut to
 * six; and how many Events the groups left out hold.
 * @example
 * rankRecapGroups([likes12, milestone1]);
 * // { groups: [milestone1, likes12], more: 0 }: the rare milestone leads although likes are more frequent
 */
export function rankRecapGroups(groups: readonly RecapGroup[]): { groups: readonly RecapGroup[]; more: number } {
  // toSorted is stable, so groups of equal rarity and count keep the order they first came in.
  const ranked = groups.toSorted((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || b.count - a.count);

  const listed = ranked.slice(0, RECAP_GROUPS);
  const more = ranked.slice(RECAP_GROUPS).reduce((sum, group) => sum + group.count, 0);

  return { groups: listed, more };
}
