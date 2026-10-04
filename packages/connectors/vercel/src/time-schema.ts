import * as v from 'valibot';

/** A time in milliseconds since the epoch, as Vercel gives every time. */
export const TIME_SCHEMA: v.GenericSchema<number> = v.pipe(v.number(), v.finite());
