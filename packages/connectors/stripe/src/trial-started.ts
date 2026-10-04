import type { Language, SourceEvent } from '@deskorama/core';
import type { EventBase } from './event-base.ts';
import { pricePerPeriod } from './price-per-period.ts';
import type { RecurringPrice } from './recurring-price.ts';

/**
 * Returns the Event of a subscription that starts on a free trial: an arrival, since nothing is paid yet, with what
 * it will bill after the trial in the detail.
 * @example
 * trialStarted(base, { amount: 4900, currency: 'eur', interval: 'month', count: 1 }).text.fr;
 * // { label: 'Nouvel abonnement', detail: 'Essai gratuit, puis 49 € par mois', tag: 'ESSAI' }
 */
export function trialStarted(base: EventBase, price: RecurringPrice | null): SourceEvent {
  const then = (lang: Language, words: string) => (price === null ? '' : `${words} ${pricePerPeriod(price, lang)}`);

  return {
    ...base,
    archetype: 'arrival',
    rarity: 'common',
    text: {
      fr: { label: 'Nouvel abonnement', detail: `Essai gratuit${then('fr', ', puis')}`, tag: 'ESSAI' },
      en: { label: 'New subscription', detail: `Free trial${then('en', ', then')}`, tag: 'TRIAL' },
    },
  };
}
