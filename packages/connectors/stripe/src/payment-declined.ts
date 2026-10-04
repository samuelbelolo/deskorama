import type { Language, SourceEvent } from '@deskorama/core';
import { declineReason } from './decline-reason.ts';
import type { EventBase } from './event-base.ts';
import { formatAmount } from './format-amount.ts';
import type { StripePaymentIntent } from './payment-intent-schema.ts';

/**
 * Returns the Event of a payment that failed: a rejection, with why and how much in the detail.
 * @example
 * paymentDeclined(base, { amount: 12900, currency: 'eur', last_payment_error: { code: 'expired_card' } }).text.en;
 * // { label: 'Payment declined', detail: 'Card expired, €129', tag: 'DECLINED' }
 */
export function paymentDeclined(base: EventBase, intent: StripePaymentIntent): SourceEvent {
  const detail = (lang: Language) =>
    `${declineReason(intent, lang)}, ${formatAmount(intent.amount, intent.currency, lang)}`;

  return {
    ...base,
    archetype: 'rejection',
    rarity: 'common',
    text: {
      fr: { label: 'Paiement refusé', detail: detail('fr'), tag: 'REFUSÉ' },
      en: { label: 'Payment declined', detail: detail('en'), tag: 'DECLINED' },
    },
  };
}
