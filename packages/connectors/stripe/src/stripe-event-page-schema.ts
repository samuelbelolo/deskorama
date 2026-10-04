import * as v from 'valibot';

/** One Stripe event, once validated: its object is read by the schema of its type. */
export interface StripeEvent {
  readonly id: string;
  readonly type: string;
  /** Seconds since the Unix epoch. */
  readonly created: number;
  readonly data: {
    readonly object: unknown;
    /** The fields an update changed, with their former values. */
    readonly previous_attributes?: unknown;
  };
}

/** A page of Stripe's event list, once validated. */
export interface StripeEventPage {
  /** Newest first, even after `ending_before`. */
  readonly data: readonly StripeEvent[];
  /** True when more events wait beyond this page. */
  readonly has_more: boolean;
}

/**
 * A page of Stripe's event list. Each event's object is rendered in the API version of the day it happened, so only
 * the envelope is checked here, the same in every version.
 * @example
 * { "object": "list", "data": [{ "id": "evt_1Kv…", "type": "payment_intent.succeeded", "created": 1791121800,
 *   "data": { "object": { … } } }], "has_more": false }
 */
export const STRIPE_EVENT_PAGE_SCHEMA: v.GenericSchema<unknown, StripeEventPage> = v.object({
  data: v.array(
    v.object({
      id: v.pipe(v.string(), v.nonEmpty()),
      type: v.string(),
      created: v.pipe(v.number(), v.integer()),
      data: v.object({ object: v.unknown(), previous_attributes: v.optional(v.unknown()) }),
    }),
  ),
  has_more: v.boolean(),
});
