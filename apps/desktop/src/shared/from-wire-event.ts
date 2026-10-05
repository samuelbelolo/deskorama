import type { WallpaperEvent } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/**
 * Returns the Event a wire Event carries.
 * @example
 * fromWireEvent(toWireEvent(merged)); // equal to merged
 */
export function fromWireEvent(wire: WireEvent): WallpaperEvent {
  return { ...wire, at: new Date(wire.at) };
}
