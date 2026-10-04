import { parsePayload, type SourceEvent } from '@deskorama/core';
import * as v from 'valibot';
import type { EventBase } from './event-base.ts';
import { freePlanStarted } from './free-plan-started.ts';
import { payingSubscription } from './paying-subscription.ts';
import { recurringPrice } from './recurring-price.ts';
import type { StripeEvent } from './stripe-event-page-schema.ts';
import { SUBSCRIPTION_SCHEMA } from './subscription-schema.ts';
import { trialStarted } from './trial-started.ts';

/** The former status an update lists among the fields it changed. */
const CHANGED_STATUS = v.object({ status: v.string() });

/**
 * Returns the Event a subscription event means, or null when it starts nothing. A subscription starts when it is
 * created, or when an update moves it out of `incomplete` once its first payment goes through; it starts paying,
 * on a free trial, or on a free plan. An update from `trialing` to `active` on a paying plan is a trial converted.
 * Every other update, a renewal or a change of plan, is nothing new.
 * @example
 * await readSubscriptionEvent({ id: 'evt_1KvSubNew0001', type: 'customer.subscription.created', created: 1791121200,
 *   data: { object: { status: 'active', items: { data: [] } } } }, base);
 * // { archetype: 'money', text: { en: { label: 'New subscription', … } }, … }
 */
export async function readSubscriptionEvent(event: StripeEvent, base: EventBase): Promise<SourceEvent | null> {
  const subscription = await parsePayload(SUBSCRIPTION_SCHEMA, event.data.object, `The Stripe event ${event.id}`);

  const changed = v.safeParse(CHANGED_STATUS, event.data.previous_attributes);
  const before = changed.success ? changed.output.status : null;

  const price = recurringPrice(subscription);

  // A plan at no cost brings no money in: it starts as an arrival, and converting to it is nothing new.
  const free = price !== null && price.amount === 0;

  if (before === 'trialing' && subscription.status === 'active' && !free) {
    return payingSubscription(base, price, { fr: 'Essai converti en abonnement', en: 'Trial converted to paid' });
  }

  const starts = event.type === 'customer.subscription.created' || before === 'incomplete';

  if (!starts) return null;

  if (subscription.status === 'active' && free) return freePlanStarted(base);

  if (subscription.status === 'active') {
    return payingSubscription(base, price, { fr: 'Nouvel abonnement', en: 'New subscription' });
  }

  return subscription.status === 'trialing' ? trialStarted(base, price) : null;
}
