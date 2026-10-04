import type { SourceEvent } from '@deskorama/core';

/**
 * A Source Event as it crosses from the main process to a renderer: the same fields, with its time as milliseconds
 * since the epoch, because a `Date` does not survive the context bridge.
 */
export type WireEvent = Omit<SourceEvent, 'at'> & { readonly at: number };
