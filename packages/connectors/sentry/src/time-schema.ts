import * as v from 'valibot';

/** An ISO 8601 time, as Sentry gives every time. */
export const TIME_SCHEMA: v.GenericSchema<string> = v.pipe(
  v.string(),
  v.check((value) => Number.isFinite(Date.parse(value)), 'an ISO 8601 time'),
);
