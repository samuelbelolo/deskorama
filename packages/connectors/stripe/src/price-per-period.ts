import type { Language } from '@deskorama/core';
import { formatAmount } from './format-amount.ts';
import type { RecurringPrice } from './recurring-price.ts';
import type { BillingInterval } from './subscription-schema.ts';

/** How each language says "per period", for one period and for several. */
const PERIODS: Readonly<Record<Language, Readonly<Record<BillingInterval, (count: number) => string>>>> = {
  fr: {
    day: (count) => (count === 1 ? 'par jour' : `tous les ${count} jours`),
    week: (count) => (count === 1 ? 'par semaine' : `toutes les ${count} semaines`),
    month: (count) => (count === 1 ? 'par mois' : `tous les ${count} mois`),
    year: (count) => (count === 1 ? 'par an' : `tous les ${count} ans`),
  },
  en: {
    day: (count) => (count === 1 ? 'a day' : `every ${count} days`),
    week: (count) => (count === 1 ? 'a week' : `every ${count} weeks`),
    month: (count) => (count === 1 ? 'a month' : `every ${count} months`),
    year: (count) => (count === 1 ? 'a year' : `every ${count} years`),
  },
};

/**
 * Returns what a subscription bills each period, in words of the display language.
 * @example
 * pricePerPeriod({ amount: 4900, currency: 'eur', interval: 'month', count: 1 }, 'fr'); // "49 € par mois"
 * pricePerPeriod({ amount: 12000, currency: 'usd', interval: 'month', count: 3 }, 'en'); // "$120 every 3 months"
 */
export function pricePerPeriod(price: RecurringPrice, lang: Language): string {
  return `${formatAmount(price.amount, price.currency, lang)} ${PERIODS[lang][price.interval](price.count)}`;
}
