import type { WallpaperEvent } from '@deskorama/core';

/**
 * Returns the word a Gag paints on its prop: the Event's tag, else the airport's own word for that prop, in
 * capitals unless the prop keeps the tag's case (a version number on a flag reads "v2.5.0").
 * @example
 * tagWord(merged, 'VALIDÉ'); // "MERGED"
 * tagWord(release, 'NOUVEAU', true); // "v2.5.0"
 */
export function tagWord(event: WallpaperEvent, fallback: string, keepCase = false): string {
  const tag = event.meta.tag.trim();
  if (tag === '') return fallback;

  return keepCase ? tag : tag.toUpperCase();
}
