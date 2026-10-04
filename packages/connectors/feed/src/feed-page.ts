import type { BuildState } from '@deskorama/core';
import type { PostedEvent } from '@deskorama/event-json';

/** One page of a Feed, once validated: the Events after the cursor, and where to resume. */
export interface FeedPage {
  /** Oldest first; each has an id, so a replayed page is dropped. */
  readonly events: readonly (PostedEvent & { readonly id: string })[];
  /** The cursor to send next time; null while the Feed has no Event at all. */
  readonly next_cursor: string | null;
  /** True when more Events wait after this page: the Feed is polled again at once. */
  readonly has_more: boolean;
  /** Seconds the backend asks to wait before the next poll, kept within the Feed's bounds. */
  readonly poll_interval?: number | undefined;
  /** Gauge values the backend reports; those left out keep their value. */
  readonly gauges?:
    | {
        readonly crowd?: number | undefined;
        readonly daily?: number | undefined;
        readonly total?: number | undefined;
        readonly build?: BuildState | undefined;
      }
    | undefined;
}
