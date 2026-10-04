import type { WallpaperEvent } from '@deskorama/core';
import { tagRows } from './tag-rows.ts';

/**
 * Returns an Event's tag on one row that fits a width, or an empty word when it has none or it does not fit: a
 * prop then shows its plain picture and the plaque says the rest.
 * @example
 * tagWord(event, 34); // "+129 €"
 */
export function tagWord(event: WallpaperEvent, width: number): string {
  return tagRows(event.meta.tag, width, 1)?.[0] ?? '';
}
