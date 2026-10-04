import type { Archetype } from './archetype.ts';
import { rankRecapGroups } from './rank-recap-groups.ts';
import type { Rarity } from './rarity.ts';
import { rarityRank } from './rarity-rank.ts';
import type { Recap, RecapGroup } from './recap.ts';
import { stepOf } from './step-of.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** How many of the latest missed Events are kept to play after a short hide; older ones only count. */
const LATEST_KEPT = 12;

/** The Events that arrived while the wallpaper was hidden. */
export interface Missed {
  /** Takes a missed Event into account. */
  add(event: WallpaperEvent): void;
  /** True while nothing was missed. */
  isEmpty(): boolean;
  /** The latest missed Events, oldest first: at most twelve. */
  latest(): readonly WallpaperEvent[];
  /** The recap of everything missed between `from` and `to`. */
  recap(from: Date, to: Date): Recap;
  /**
   * The missed deploy step the scene still has to show: the latest one, when it failed or started. Null when no
   * deploy step was missed, or the latest one succeeded, which leaves nothing on the runway.
   */
  owedDeploy(): WallpaperEvent | null;
}

/**
 * Returns an empty record of missed Events. It keeps one count per Role and a dozen Events, never the whole list, so
 * a wallpaper hidden for a night on a busy Source holds a bounded memory.
 * @example
 * const missed = createMissed();
 * missed.add(like);
 * missed.add(deployFailed);
 * missed.recap(new Date(from), new Date(to)).groups; // the failed deploy first, then the like
 * missed.owedDeploy(); // deployFailed
 */
export function createMissed(): Missed {
  const groups = new Map<Archetype | null, RecapGroup>();
  let latest: readonly WallpaperEvent[] = [];
  let lastDeploy: WallpaperEvent | null = null;

  return {
    add(event) {
      const group = groups.get(event.archetype);
      groups.set(event.archetype, {
        archetype: event.archetype,
        rarity: group === undefined ? event.rarity : rarer(group.rarity, event.rarity),
        count: (group?.count ?? 0) + 1,
        latest: event,
      });

      latest = [...latest, event].slice(-LATEST_KEPT);

      if (stepOf(event) !== undefined) lastDeploy = event;
    },

    isEmpty: () => groups.size === 0,

    latest: () => latest,

    recap(from, to) {
      const all = Array.from(groups.values());
      const total = all.reduce((sum, group) => sum + group.count, 0);
      return { from, to, total, ...rankRecapGroups(all) };
    },

    owedDeploy: () => (lastDeploy === null || stepOf(lastDeploy) === 'succeeded' ? null : lastDeploy),
  };
}

/**
 * Returns the rarer of two rarities.
 * @example
 * rarer('common', 'rare'); // "rare"
 */
function rarer(a: Rarity, b: Rarity): Rarity {
  return rarityRank(a) >= rarityRank(b) ? a : b;
}
