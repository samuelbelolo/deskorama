import type { Archetype, WallpaperEvent } from '@deskorama/core';

/**
 * Returns true for an Event the airport has a Role for: its Source gave it one and described its kind. Any other
 * Event plays the generic Gag and reads as unknown on the board.
 * @example
 * isDescribed(merged); // true
 * isDescribed({ ...merged, archetype: null }); // false
 */
export function isDescribed(event: WallpaperEvent): event is WallpaperEvent & { readonly archetype: Archetype } {
  return event.archetype !== null && event.recognised;
}
