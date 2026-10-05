import type { Recap } from '@deskorama/core';
import { fromWireEvent } from './from-wire-event.ts';
import type { WireRecap } from './wire-recap.ts';

/**
 * Returns the recap a wire recap carries.
 * @example
 * fromWireRecap(toWireRecap(recap)); // equal to recap
 */
export function fromWireRecap(wire: WireRecap): Recap {
  return {
    ...wire,
    from: new Date(wire.from),
    to: new Date(wire.to),
    groups: wire.groups.map((group) => ({ ...group, latest: fromWireEvent(group.latest) })),
  };
}
