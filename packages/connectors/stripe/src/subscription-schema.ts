import * as v from 'valibot';
import { STRIPE_AMOUNT, STRIPE_CURRENCY } from './stripe-money-schemas.ts';

/** How often a price bills. */
export type BillingInterval = 'day' | 'week' | 'month' | 'year';

/** The fields of a subscription item's price the Connector reads. */
interface StripePrice {
  /** Null for a price billed by usage or by tiers. */
  readonly unit_amount?: number | null | undefined;
  readonly currency: string;
  /** Null for a one-time price. */
  readonly recurring?:
    | {
        readonly interval: BillingInterval;
        readonly interval_count: number;
        /** `metered` bills the unit amount per use, so the period's total is unknown. */
        readonly usage_type?: string | undefined;
      }
    | null
    | undefined;
  /** Set when quantities are billed in groups, so the total is not the unit amount times the quantity. */
  readonly transform_quantity?: unknown;
}

/** The fields of a subscription the Connector reads; it never reads the customer. */
export interface StripeSubscription {
  /** `active`, `trialing`, `incomplete` and the others; kept open, so a new status reads as nothing new. */
  readonly status: string;
  readonly items: {
    readonly data: readonly {
      readonly quantity?: number | null | undefined;
      /** Missing in API versions older than prices. */
      readonly price?: StripePrice | null | undefined;
    }[];
  };
}

/**
 * The object of a `customer.subscription.*` event.
 * @example
 * { "id": "sub_1Kv…", "object": "subscription", "status": "active", "items": { "data": [{ "quantity": 1,
 *   "price": { "unit_amount": 4900, "currency": "eur", "recurring": { "interval": "month", "interval_count": 1 } } }] } }
 */
export const SUBSCRIPTION_SCHEMA: v.GenericSchema<unknown, StripeSubscription> = v.object({
  status: v.string(),
  items: v.object({
    data: v.array(
      v.object({
        quantity: v.nullish(v.pipe(v.number(), v.integer(), v.minValue(0))),
        price: v.nullish(
          v.object({
            unit_amount: v.nullish(STRIPE_AMOUNT),
            currency: STRIPE_CURRENCY,
            recurring: v.nullish(
              v.object({
                interval: v.picklist(['day', 'week', 'month', 'year']),
                interval_count: v.pipe(v.number(), v.integer(), v.minValue(1)),
                usage_type: v.optional(v.string()),
              }),
            ),
            transform_quantity: v.optional(v.unknown()),
          }),
        ),
      }),
    ),
  }),
});
