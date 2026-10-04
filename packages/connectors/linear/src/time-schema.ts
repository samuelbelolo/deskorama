import * as v from 'valibot';

/** An ISO 8601 time, as Linear gives every time: kept as Linear wrote it, since Event ids are built from it. */
export const TIME_SCHEMA: v.GenericSchema<string> = v.pipe(
  v.string(),
  v.check((value) => Number.isFinite(Date.parse(value)), 'an ISO 8601 time'),
);
