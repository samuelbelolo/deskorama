import type { Connector } from '@deskorama/core';
import { STRIPE_ABOUT } from './stripe-about.ts';
import { pollStripe } from './poll-stripe.ts';
import { STRIPE_CONFIG } from './stripe-config.ts';
import { STRIPE_GAUGES } from './stripe-gauges.ts';

/**
 * Returns the Stripe Connector: with a restricted read key, it polls the account's events for payments received,
 * payments declined and new subscriptions, every 5 minutes by default to stay within Stripe's read allocation.
 * @example
 * const stripe = createStripe();
 * await stripe.poll({ settings: { name: 'Kavelo', values: {}, token }, cursor: null, fetch: net.fetch,
 *   now: clock.now() });
 * // { events: [ … ], cursor: 'evt_1KvKaveloSubRenew01' }
 */
export function createStripe(): Connector {
  return {
    id: 'stripe',
    title: { fr: 'Stripe', en: 'Stripe' },
    about: STRIPE_ABOUT,
    config: STRIPE_CONFIG,
    gauges: STRIPE_GAUGES,
    poll: pollStripe,
  };
}
