import * as v from 'valibot';

/** The id of a Source, as the settings page and the settings file name one. */
export const SOURCE_ID: v.GenericSchema<unknown, string> = v.pipe(v.string(), v.nonEmpty(), v.maxLength(100));
