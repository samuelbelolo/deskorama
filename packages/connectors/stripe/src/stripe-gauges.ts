import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a Stripe Source's Gauges, those of a subscription product: payments raise today's count and each new
 * paying subscription the subscribers. Both count what the Events bring, never the account's own totals, which would
 * cost reads Stripe's allocation cannot spare. Stripe knows nothing of who is online: another Source feeds the crowd.
 * A short label is a noun: the Theme adds when it counts (now, today, in total).
 */
export const STRIPE_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 36,
    text: {
      fr: { label: 'Utilisateurs connectés', short: 'EN LIGNE' },
      en: { label: 'Users online', short: 'ONLINE' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Paiements aujourd’hui', short: 'PAIEMENTS' },
      en: { label: 'Payments today', short: 'PAYMENTS' },
    },
  },
  total: {
    text: {
      fr: { label: 'Nouveaux abonnés', short: 'ABONNÉS' },
      en: { label: 'New subscribers', short: 'SUBSCRIBERS' },
    },
  },
};
