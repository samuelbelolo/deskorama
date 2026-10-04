import type { Language, SourceEvent } from '@deskorama/core';
import { amountTag } from './amount-tag.ts';
import type { EventBase } from './event-base.ts';
import { pricePerPeriod } from './price-per-period.ts';
import type { RecurringPrice } from './recurring-price.ts';

/**
 * Returns the Event of a subscription that starts paying, whether new or a trial converted: money, notable, with what
 * it bills each period in the detail and on the tag, and one more subscriber.
 * @example
 * payingSubscription(base, { amount: 4900, currency: 'eur', interval: 'month', count: 1 },
 *   { fr: 'Nouvel abonnement', en: 'New subscription' }).text.en;
 * // { label: 'New subscription', detail: '€49 a month', tag: '+€49' }
 */
export function payingSubscription(
  base: EventBase,
  price: RecurringPrice | null,
  label: Readonly<Record<Language, string>>,
): SourceEvent {
  const detail = (lang: Language, otherwise: string) => (price === null ? otherwise : pricePerPeriod(price, lang));

  const tag = (lang: Language, otherwise: string) =>
    price === null ? otherwise : amountTag(price.amount, price.currency, lang);

  return {
    ...base,
    archetype: 'money',
    rarity: 'notable',
    gauge: { role: 'total', by: 1 },
    text: {
      fr: { label: label.fr, detail: detail('fr', 'Abonnement payant'), tag: tag('fr', 'ABONNÉ') },
      en: { label: label.en, detail: detail('en', 'Paid subscription'), tag: tag('en', 'SUBSCRIBED') },
    },
  };
}
