import type { Language, WallpaperEvent } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';

/**
 * Returns a milestone, the rare big moment, as a Theme receives it in one display language.
 * @example
 * milestone('fr').meta.tag; // "1 000"
 */
export function milestone(lang: Language): WallpaperEvent {
  return wallpaperEventFixture(lang, {
    id: 'milestone',
    archetype: 'celebration',
    rarity: 'rare',
    text: {
      fr: { label: 'Cap des 1 000 pull requests mergées', detail: 'Depuis la création du dépôt', tag: '1 000' },
      en: { label: '1,000 pull requests merged', detail: 'Since the repository was created', tag: '1,000' },
    },
  });
}
