import {
  ConnectorError,
  parsePayload,
  readJson,
  responseFailure,
  sendRequest,
  type PollInput,
  type PollResult,
  type SourceEvent,
} from '@deskorama/core';
import { isStaleCursor } from './is-stale-cursor.ts';
import { PAYMENT_INTENTS_READ } from './stripe-config.ts';
import { STRIPE_EVENT_PAGE_SCHEMA } from './stripe-event-page-schema.ts';
import { stripeEventsUrl } from './stripe-events-url.ts';
import { toStripeSourceEvent } from './to-stripe-source-event.ts';

/**
 * Polls Stripe once: one read of the account's event list, after the event the cursor names, with the restricted key.
 * Stripe lists the newest first, so the Events come back reversed, oldest first, and the newest event becomes the
 * cursor, whether it meant something or not. An event whose object its schema refuses is skipped rather than failing
 * the page, so one odd event never holds the cursor back; a changed API still fails loudly on the page itself. More
 * events waiting poll again at once; a cursor Stripe no longer knows starts over at once. A refused key names the
 * payments permission, since one 403 cannot tell which resource it lacked.
 * @example
 * await pollStripe({ settings: { name: 'Kavelo', values: {}, token: 'rk_live_…' }, cursor: null, fetch, now });
 * // { events: [ … ], cursor: 'evt_1KvSubNew0001' }
 */
export async function pollStripe(input: PollInput): Promise<PollResult> {
  const headers = { Accept: 'application/json', Authorization: `Bearer ${input.settings.token}` };

  const response = await sendRequest(input.fetch, stripeEventsUrl(input.cursor), { method: 'GET', headers });

  const unknownId = response.status === 400 || response.status === 404;

  if (input.cursor !== null && unknownId && isStaleCursor(await readJson(response, 'The Stripe error'))) {
    return { events: [], cursor: null, delay: 0 };
  }

  const failure = responseFailure(response, input.now, PAYMENT_INTENTS_READ);

  if (failure !== null) throw failure;

  const what = 'The Stripe event list';

  const page = await parsePayload(STRIPE_EVENT_PAGE_SCHEMA, await readJson(response, what), what);

  const read = await Promise.all(
    page.data.toReversed().map((event) => skipUnreadable(toStripeSourceEvent(event, input.settings.name))),
  );

  const events = read.filter((event): event is SourceEvent => event !== null);

  const cursor = page.data[0]?.id ?? input.cursor;

  // A first poll reads only the latest few on purpose: what waits beyond them is older, not newer.
  const more = input.cursor !== null && page.has_more;

  return { events, cursor, ...(more ? { delay: 0 } : {}) };
}

/**
 * Returns the Event a read gives, or null when Stripe sent an object its schema refuses; any other error is thrown.
 * @example
 * await skipUnreadable(toStripeSourceEvent(oddSubscription, 'Kavelo')); // null
 */
async function skipUnreadable(read: Promise<SourceEvent | null>): Promise<SourceEvent | null> {
  try {
    return await read;
  } catch (error) {
    if (error instanceof ConnectorError && error.failure.kind === 'invalid-response') return null;

    throw error;
  }
}
