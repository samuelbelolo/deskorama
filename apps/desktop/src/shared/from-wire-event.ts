import type { SourceEvent } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/**
 * Returns the Source Event a wire Event carries.
 * @example
 * fromWireEvent(toWireEvent(merged)); // equal to merged
 */
export function fromWireEvent(wire: WireEvent): SourceEvent {
  return { ...wire, at: new Date(wire.at) };
}
