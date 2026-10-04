import type { Archetype, WallpaperEvent } from '@deskorama/core';

/**
 * Returns the Role a Gag and its words are picked by: "other" for an Event from a foreign Source (no Role) or of a
 * kind its Source did not describe. Never the Event's kind.
 * @example
 * roleOf(moneyEvent); // "money"
 * roleOf({ ...moneyEvent, recognised: false }); // "other"
 */
export function roleOf(event: WallpaperEvent): Archetype | 'other' {
  return event.archetype === null || !event.recognised ? 'other' : event.archetype;
}
