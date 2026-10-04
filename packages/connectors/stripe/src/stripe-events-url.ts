import { STRIPE_EVENT_TYPES } from './to-stripe-source-event.ts';

/** Stripe's list of the account's events, newest first, kept 30 days. */
const STRIPE_EVENTS = 'https://api.stripe.com/v1/events';

/** The latest events a first poll shows, so connecting a Source plays a few, not a month of them. */
const FIRST_POLL_LIMIT = 5;

/** The most events Stripe returns in one list. */
const PAGE_LIMIT = 100;

/**
 * Returns the address of the events to read: those after the event the cursor names, oldest page first, or the few
 * latest ones for the first poll.
 * @example
 * stripeEventsUrl('evt_1KvKaveloSubRenew01');
 * // "https://api.stripe.com/v1/events?types%5B%5D=payment_intent.succeeded&…&limit=100&ending_before=evt_1KvKaveloSubRenew01"
 */
export function stripeEventsUrl(cursor: string | null): string {
  const url = new URL(STRIPE_EVENTS);

  for (const type of STRIPE_EVENT_TYPES) url.searchParams.append('types[]', type);

  url.searchParams.set('limit', String(cursor === null ? FIRST_POLL_LIMIT : PAGE_LIMIT));

  if (cursor !== null) url.searchParams.set('ending_before', cursor);

  return url.href;
}
