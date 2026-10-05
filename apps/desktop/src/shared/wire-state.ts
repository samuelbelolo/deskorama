import type { SharedSnapshot, Today } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/** Today's tally on the wire, its last deploy in its wire form. */
type WireToday = Omit<Today, 'lastDeploy'> & { readonly lastDeploy: WireEvent | null };

/**
 * What every screen shares as it crosses from the main process to every wallpaper page: the Gauges, today's tally
 * and the recent Events, the Events in their wire form.
 */
export type WireState = Omit<SharedSnapshot, 'today' | 'recent'> & {
  readonly today: WireToday;
  readonly recent: readonly WireEvent[];
};
