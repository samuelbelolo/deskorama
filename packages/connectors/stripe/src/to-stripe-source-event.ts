import { parsePayload, type SourceEvent } from '@deskorama/core';
import { eventBase, type EventBase } from './event-base.ts';
import { PAYMENT_INTENT_SCHEMA, type StripePaymentIntent } from './payment-intent-schema.ts';
import { paymentDeclined } from './payment-declined.ts';
import { paymentReceived } from './payment-received.ts';
import { readSubscriptionEvent } from './read-subscription-event.ts';
import type { StripeEvent } from './stripe-event-page-schema.ts';

/** Reads one type of Stripe event into its Event, or null when it means nothing new. */
type EventReader = (event: StripeEvent, base: EventBase) => Promise<SourceEvent | null>;

/**
 * Returns a reader of `payment_intent.*` events that validates the PaymentIntent, then builds its Event.
 * @example
 * await paymentReader(paymentReceived)(event, base); // { archetype: 'money', … }
 */
function paymentReader(build: (base: EventBase, intent: StripePaymentIntent) => SourceEvent): EventReader {
  return async (event, base) =>
    build(base, await parsePayload(PAYMENT_INTENT_SCHEMA, event.data.object, `The Stripe event ${event.id}`));
}

/**
 * The reader of each event type the Connector asks Stripe for, and the only list of those types. Subscription
 * updates are read too: a subscription created `incomplete` starts only once its first payment goes through, and a
 * trial converts on an update.
 */
const READERS: Readonly<Record<string, EventReader>> = {
  'payment_intent.succeeded': paymentReader(paymentReceived),
  'payment_intent.payment_failed': paymentReader(paymentDeclined),
  'customer.subscription.created': readSubscriptionEvent,
  'customer.subscription.updated': readSubscriptionEvent,
};

/** The event types the Connector reads, in the order the event list asks for them. */
export const STRIPE_EVENT_TYPES: readonly string[] = Object.keys(READERS);

/**
 * Returns the Event a Stripe event means, named after the Source, or null for one that means nothing new, such as a
 * subscription renewed. Its object is validated by the schema of its type, and an object that schema refuses throws
 * an `invalid-response` error, which the poll turns into a skipped event.
 * @example
 * await toStripeSourceEvent({ id: 'evt_1KvPaid0001', type: 'payment_intent.succeeded', created: 1791121800,
 *   data: { object: { amount: 4900, amount_received: 4900, currency: 'eur' } } }, 'Kavelo');
 * // { id: 'evt_1KvPaid0001', archetype: 'money', text: { en: { label: 'Payment received', … } }, … }
 */
export async function toStripeSourceEvent(event: StripeEvent, source: string): Promise<SourceEvent | null> {
  const read = Object.hasOwn(READERS, event.type) ? READERS[event.type] : undefined;

  return read === undefined ? null : read(event, eventBase(event, source));
}
