import type { Language, SourceEvent } from '@deskorama/core';
import { amountTag } from './amount-tag.ts';
import type { EventBase } from './event-base.ts';
import { formatAmount } from './format-amount.ts';
import type { StripePaymentIntent } from './payment-intent-schema.ts';

/**
 * Returns the Event of a payment that went through: money, the amount collected in the detail and on the tag, and
 * one more payment today.
 * @example
 * paymentReceived(base, { amount: 4900, amount_received: 4900, currency: 'eur' }).text.fr;
 * // { label: 'Paiement reçu', detail: 'Encaissement de 49 €', tag: '+49 €' }
 */
export function paymentReceived(base: EventBase, intent: StripePaymentIntent): SourceEvent {
  const amount = intent.amount_received ?? intent.amount;

  const full = (lang: Language) => formatAmount(amount, intent.currency, lang);
  const tag = (lang: Language) => amountTag(amount, intent.currency, lang);

  return {
    ...base,
    archetype: 'money',
    rarity: 'common',
    gauge: { role: 'daily', by: 1 },
    text: {
      fr: { label: 'Paiement reçu', detail: `Encaissement de ${full('fr')}`, tag: tag('fr') },
      en: { label: 'Payment received', detail: `${full('en')} collected`, tag: tag('en') },
    },
  };
}
