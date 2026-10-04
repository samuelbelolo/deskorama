import * as v from 'valibot';

/** The part of Stripe's error object that says what went wrong. */
const STRIPE_ERROR = v.object({ error: v.object({ code: v.optional(v.string()) }) });

/**
 * Returns true when Stripe's error says the cursor names an event it does not know: one older than the 30 days Stripe
 * keeps, after the Mac stayed off a month, or one from test mode once the key became a live one. The cursor is the
 * only id the request sends, so a missing resource can only be that event.
 * @example
 * isStaleCursor({ error: { type: 'invalid_request_error', code: 'resource_missing', param: 'ending_before' } }); // true
 * isStaleCursor({ error: { type: 'invalid_request_error', code: 'parameter_unknown' } }); // false
 */
export function isStaleCursor(body: unknown): boolean {
  const parsed = v.safeParse(STRIPE_ERROR, body);

  return parsed.success && parsed.output.error.code === 'resource_missing';
}
