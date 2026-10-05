import type { WallpaperEvent } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/**
 * Returns the Event in its wire form, ready to cross to a wallpaper page.
 * @example
 * toWireEvent(merged).at; // 1791122400000
 */
export function toWireEvent(event: WallpaperEvent): WireEvent {
  return { ...event, at: event.at.getTime() };
}
