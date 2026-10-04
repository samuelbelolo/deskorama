import * as v from 'valibot';

/** An amount as Stripe counts it: a whole number of the currency's smallest unit, never negative. */
export const STRIPE_AMOUNT: v.GenericSchema<unknown, number> = v.pipe(v.number(), v.integer(), v.minValue(0));

/** A currency as a three-letter ISO code, read in lowercase as Stripe writes it, whatever its case. */
export const STRIPE_CURRENCY: v.GenericSchema<unknown, string> = v.pipe(
  v.string(),
  v.regex(/^[a-z]{3}$/iu),
  v.toLowerCase(),
);
