import * as v from 'valibot';

/** A GitHub timestamp, such as "2026-10-04T13:52:00Z", read as milliseconds since the epoch. */
export const TIME_SCHEMA: v.GenericSchema<string, number> = v.pipe(
  v.string(),
  v.check((text) => Number.isFinite(Date.parse(text)), 'a date and time'),
  v.transform((text) => Date.parse(text)),
);
