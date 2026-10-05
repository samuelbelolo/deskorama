import type { Recap } from '@deskorama/core';
import { toWireEvent } from './to-wire-event.ts';
import type { WireRecap } from './wire-recap.ts';

/**
 * Returns the recap in its wire form, ready to cross to a wallpaper page.
 * @example
 * toWireRecap(recap).from; // 1791122400000
 */
export function toWireRecap(recap: Recap): WireRecap {
  return {
    ...recap,
    from: recap.from.getTime(),
    to: recap.to.getTime(),
    groups: recap.groups.map((group) => ({ ...group, latest: toWireEvent(group.latest) })),
  };
}
