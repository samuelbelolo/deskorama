import type { Archetype, Language, WallpaperEvent } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';

/**
 * Returns an Event of one Role in one display language, with the default fixture's words and, when given, a tag.
 * @example
 * roleEvent('en', 'like', 'LGTM').meta.tag; // "LGTM"
 */
export function roleEvent(lang: Language, archetype: Archetype, tag?: string): WallpaperEvent {
  const event = wallpaperEventFixture(lang, { archetype, id: `${archetype}-${tag ?? 'default'}` });

  return tag === undefined ? event : { ...event, meta: { ...event.meta, tag } };
}
