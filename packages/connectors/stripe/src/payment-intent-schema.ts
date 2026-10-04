import * as v from 'valibot';
import { STRIPE_AMOUNT, STRIPE_CURRENCY } from './stripe-money-schemas.ts';

/** The fields of a PaymentIntent the Connector reads; it never reads the customer, the description or an e-mail. */
export interface StripePaymentIntent {
  /** What was asked, in the currency's smallest unit. */
  readonly amount: number;
  /** What was collected, in the currency's smallest unit. */
  readonly amount_received?: number | null | undefined;
  readonly currency: string;
  /** Why the last attempt failed: Stripe's error code and, for a card, the bank's decline code. */
  readonly last_payment_error?:
    | {
        readonly code?: string | null | undefined;
        readonly decline_code?: string | null | undefined;
      }
    | null
    | undefined;
}

/**
 * The object of a `payment_intent.*` event.
 * @example
 * { "id": "pi_3Kv…", "object": "payment_intent", "amount": 4900, "amount_received": 4900, "currency": "eur" }
 */
export const PAYMENT_INTENT_SCHEMA: v.GenericSchema<unknown, StripePaymentIntent> = v.object({
  amount: STRIPE_AMOUNT,
  amount_received: v.nullish(STRIPE_AMOUNT),
  currency: STRIPE_CURRENCY,
  last_payment_error: v.nullish(v.object({ code: v.nullish(v.string()), decline_code: v.nullish(v.string()) })),
});
