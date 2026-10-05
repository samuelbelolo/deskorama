import type { Recap, RecapGroup } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/** One group of a recap on the wire, its newest Event in its wire form. */
type WireRecapGroup = Omit<RecapGroup, 'latest'> & { readonly latest: WireEvent };

/**
 * A recap as it crosses from the main process to the wallpaper page that shows it: the same fields, with its two
 * instants as milliseconds since the epoch and its Events in their wire form.
 */
export type WireRecap = Omit<Recap, 'from' | 'to' | 'groups'> & {
  readonly from: number;
  readonly to: number;
  readonly groups: readonly WireRecapGroup[];
};
