import * as v from 'valibot';

/** Any JSON object. */
const SETTINGS = v.record(v.string(), v.unknown());

/**
 * Returns the settings in the text of `settings.json` as a plain object, or null when there is no file, it is not
 * JSON or it is not an object.
 * @example
 * readSettingsObject('{"theme":"aeroport"}'); // { theme: 'aeroport' }
 * readSettingsObject('not json'); // null
 */
export function readSettingsObject(settingsFile: string | null): Record<string, unknown> | null {
  if (settingsFile === null) return null;

  try {
    const parsed = v.safeParse(SETTINGS, JSON.parse(settingsFile));

    return parsed.success ? parsed.output : null;
  } catch {
    return null;
  }
}
