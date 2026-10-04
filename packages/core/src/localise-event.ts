import type { Language } from './language.ts';
import type { SourceEvent } from './source-event.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Returns the Event a Theme receives: the Source Event with its words in one display language.
 * @example
 * const event = localiseEvent(merged, 'en');
 * event.label; // "Pull request merged"
 * event.meta.tag; // "MERGED"
 */
export function localiseEvent(event: SourceEvent, lang: Language): WallpaperEvent {
  const { label, detail, tag } = event.text[lang];
  const meta = event.step === undefined ? { detail, tag } : { detail, tag, step: event.step };
  const base = {
    id: event.id,
    kind: event.kind,
    archetype: event.archetype,
    recognised: event.recognised,
    rarity: event.rarity,
    label,
    source: event.source,
    at: event.at,
    meta,
  };
  return event.gauge === undefined ? base : { ...base, gauge: event.gauge };
}
