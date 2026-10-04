import type { BillingInterval, StripeSubscription } from './subscription-schema.ts';

/** What a subscription bills each period, at list price. */
export interface RecurringPrice {
  /** In the currency's smallest unit. */
  readonly amount: number;
  readonly currency: string;
  readonly interval: BillingInterval;
  /** How many intervals one period lasts, e.g. 3 for every 3 months. */
  readonly count: number;
}

/** One item of a subscription. */
type SubscriptionItem = StripeSubscription['items']['data'][number];

/**
 * Returns what a subscription bills each period: the unit prices times the quantities of its items, or null when the
 * total is not known in advance. That is when an item bills by usage, by tiers or in groups of units, or when its
 * items bill in different currencies or periods: a partial sum would show a wrong price, or a paid plan as free.
 * @example
 * recurringPrice({ status: 'active', items: { data: [{ quantity: 3, price: { unit_amount: 1900, currency: 'eur',
 *   recurring: { interval: 'month', interval_count: 1 } } }] } });
 * // { amount: 5700, currency: 'eur', interval: 'month', count: 1 }
 */
export function recurringPrice(subscription: StripeSubscription): RecurringPrice | null {
  const prices = subscription.items.data.map(fixedPrice);

  const first = prices[0];

  if (first === undefined || first === null) return null;

  let amount = 0;

  for (const price of prices) {
    const alike =
      price !== null &&
      price.currency === first.currency &&
      price.interval === first.interval &&
      price.count === first.count;

    if (!alike) return null;

    amount += price.amount;
  }

  return { ...first, amount };
}

/**
 * Returns what one item bills each period, or null when it does not bill a fixed amount: a usage-based, tiered or
 * one-time price, or units billed in groups.
 * @example
 * fixedPrice({ quantity: 2, price: { unit_amount: 1900, currency: 'eur',
 *   recurring: { interval: 'month', interval_count: 1 } } }); // { amount: 3800, currency: 'eur', interval: 'month', count: 1 }
 * fixedPrice({ quantity: 1, price: { unit_amount: 10, currency: 'eur',
 *   recurring: { interval: 'month', interval_count: 1, usage_type: 'metered' } } }); // null
 */
function fixedPrice({ quantity, price }: SubscriptionItem): RecurringPrice | null {
  const unitAmount = price?.unit_amount ?? null;
  const recurring = price?.recurring ?? null;
  const grouped = price?.transform_quantity !== undefined && price?.transform_quantity !== null;

  if (price === null || price === undefined || unitAmount === null || recurring === null || grouped) return null;

  if (recurring.usage_type === 'metered') return null;

  const { interval, interval_count: count } = recurring;

  return { amount: unitAmount * (quantity ?? 1), currency: price.currency, interval, count };
}
