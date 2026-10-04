import type { SourceEvent } from '@deskorama/core';
import type { StripeEvent } from './stripe-event-page-schema.ts';

/** What every Event from Stripe shares: its id, kind, Source and time come from the Stripe event. */
export type EventBase = Pick<SourceEvent, 'id' | 'kind' | 'recognised' | 'source' | 'at'>;

/**
 * Returns the fields every Event from Stripe takes from the Stripe event it comes from: the event's id, so a
 * replayed page is dropped, its type as the kind, and its time.
 * @example
 * eventBase({ id: 'evt_1KvPaid0001', type: 'payment_intent.succeeded', created: 1791121800, data: { object: {} } },
 *   'Kavelo');
 * // { id: 'evt_1KvPaid0001', kind: 'payment_intent.succeeded', recognised: true, source: 'Kavelo', at: Date }
 */
export function eventBase(event: StripeEvent, source: string): EventBase {
  return {
    id: event.id,
    kind: event.type,
    recognised: true,
    source,
    at: new Date(event.created * 1000),
  };
}
