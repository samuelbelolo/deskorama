import type { ConnectorConfig } from '@deskorama/core';

/** What a restricted key needs to read payment events, named as in the Stripe Dashboard. */
export const PAYMENT_INTENTS_READ = 'Payment Intents: Read';

/** What a restricted key needs to read subscription events, named as in the Stripe Dashboard. */
const SUBSCRIPTIONS_READ = 'Subscriptions: Read';

/**
 * What a person fills in to connect Stripe: only a restricted key, which reads an event type only with Read on the
 * resource it is about. Polled every 5 minutes by default: Stripe grants every account at least 10,000 reads a month,
 * one every 4 minutes 20 seconds, and more only with its transaction volume; a busy account may lower it to a minute.
 */
export const STRIPE_CONFIG: ConnectorConfig = {
  fields: [],
  permissions: [
    {
      name: PAYMENT_INTENTS_READ,
      why: {
        fr: 'Voir les paiements reçus et refusés.',
        en: 'See payments received and declined.',
      },
    },
    {
      name: SUBSCRIPTIONS_READ,
      why: {
        fr: 'Voir les nouveaux abonnements.',
        en: 'See new subscriptions.',
      },
    },
  ],
  interval: { min: 60_000, default: 5 * 60_000, max: 15 * 60_000 },
};
