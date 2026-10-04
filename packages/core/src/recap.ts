import type { Archetype } from './archetype.ts';
import type { Rarity } from './rarity.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * What happened while the wallpaper was hidden, sent once to the screen with the most visible wallpaper when it
 * shows again. The engine groups and sorts; the Theme draws it in its own words, readable in under ten seconds.
 */
export interface Recap {
  /** When the wallpaper became fully hidden. */
  readonly from: Date;
  /** When it showed again. */
  readonly to: Date;
  /** How many Events were missed: the counts of `groups` plus `more`. */
  readonly total: number;
  /** One group per Role, rarest first, then the most frequent; at most six. */
  readonly groups: readonly RecapGroup[];
  /** How many missed Events belong to the Roles left out of `groups`: the "and N more" line, 0 when none is. */
  readonly more: number;
}

/** The missed Events of one Role. */
export interface RecapGroup {
  /** The Role; null groups every Event that plays the generic Gag for want of a Role. */
  readonly archetype: Archetype | null;
  /** The rarest rarity among the group's Events. */
  readonly rarity: Rarity;
  /** How many Events of this Role were missed. */
  readonly count: number;
  /** The newest of them, whose label and tag the Theme can paint. */
  readonly latest: WallpaperEvent;
}
