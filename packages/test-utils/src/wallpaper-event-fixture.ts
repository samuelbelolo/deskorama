import { localiseEvent, type Language, type SourceEvent, type WallpaperEvent } from '@deskorama/core';
import { sourceEventFixture } from './source-event-fixture.ts';

/**
 * Returns an Event as a Theme receives it: {@link sourceEventFixture} in one display language.
 * @example
 * wallpaperEventFixture('fr').label; // "Pull request mergée"
 * wallpaperEventFixture('en', { archetype: 'money' }).archetype; // "money"
 */
export function wallpaperEventFixture(lang: Language, overrides: Partial<SourceEvent> = {}): WallpaperEvent {
  return localiseEvent(sourceEventFixture(overrides), lang);
}
