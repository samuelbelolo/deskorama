import type { Language, WallpaperEvent } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';

/** The two shapes of an Event that plays the generic Gag. */
export type GenericShape = 'foreign' | 'undescribed';

/**
 * Returns an Event that plays the generic Gag in one language: from a foreign Source (no Role), or of a kind its
 * Source did not describe.
 * @example
 * genericEvent('fr', 'foreign').archetype; // null
 */
export function genericEvent(lang: Language, shape: GenericShape): WallpaperEvent {
  const overrides = shape === 'foreign' ? { archetype: null, source: 'Mail' } : { recognised: false };

  return wallpaperEventFixture(lang, { id: `generic-${shape}`, rarity: 'common', ...overrides });
}
