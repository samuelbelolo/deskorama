import { GAUGE_ROLES, type GaugeRole } from '@deskorama/core';
import * as v from 'valibot';
import { DEFAULT_PREFERENCES, LANGUAGE_CHOICES, type Preferences } from '../../shared/preferences.ts';
import { AVAILABLE_THEMES } from '../../shared/theme-choice.ts';
import { readSettingsObject } from '../read-settings-object.ts';
import { SOURCE_ID } from '../source-id.ts';

/**
 * Returns the preferences kept in the text of `settings.json`. A missing or unreadable file gives the defaults, and
 * a value that does not parse (a Theme the app does not ship, an unknown language) falls back to its own default,
 * so one bad value never loses the others.
 * @example
 * readPreferences('{"theme":"aeroport","language":"fr","gauges":{"daily":"src-2"}}');
 * // { theme: 'aeroport', language: 'fr', brand: null, gauges: { daily: 'src-2' } }
 * readPreferences(null); // DEFAULT_PREFERENCES
 */
export function readPreferences(settingsFile: string | null): Preferences {
  const file = readSettingsObject(settingsFile);

  if (file === null) return DEFAULT_PREFERENCES;

  const theme = v.safeParse(v.picklist(AVAILABLE_THEMES), file['theme']);
  const language = v.safeParse(v.picklist(LANGUAGE_CHOICES), file['language']);
  const brand = v.safeParse(v.nullable(SOURCE_ID), file['brand']);

  return {
    theme: theme.success ? theme.output : DEFAULT_PREFERENCES.theme,
    language: language.success ? language.output : DEFAULT_PREFERENCES.language,
    brand: brand.success ? brand.output : DEFAULT_PREFERENCES.brand,
    gauges: readGaugeSources(file['gauges']),
  };
}

/**
 * Returns the Source chosen for each Gauge role, leaving out a role whose value is not a Source id.
 * @example
 * readGaugeSources({ crowd: 'src-1', daily: 42 }); // { crowd: 'src-1' }
 */
function readGaugeSources(value: unknown): Partial<Record<GaugeRole, string>> {
  const parsed = v.safeParse(v.record(v.string(), v.unknown()), value);

  if (!parsed.success) return {};

  const chosen: Partial<Record<GaugeRole, string>> = {};

  for (const role of GAUGE_ROLES) {
    const id = v.safeParse(SOURCE_ID, parsed.output[role]);

    if (id.success) chosen[role] = id.output;
  }

  return chosen;
}
