import { GAUGE_ROLES, type GaugeRole } from '@deskorama/core';
import type { Preferences, PreferencesChange } from '../../shared/preferences.ts';

/**
 * Returns the preferences once a change is applied: what the change leaves out keeps its value, down to each Gauge
 * role, a null brand goes back to the first Source, and a null Gauge Source follows the brand Source again.
 * @example
 * applyPreferences(DEFAULT_PREFERENCES, { language: 'en', gauges: { daily: 'src-2' } });
 * // { theme: 'aeroport', language: 'en', brand: null, gauges: { daily: 'src-2' } }
 * applyPreferences({ ...DEFAULT_PREFERENCES, gauges: { daily: 'src-2' } }, { gauges: { daily: null } }).gauges; // {}
 */
export function applyPreferences(current: Preferences, change: PreferencesChange): Preferences {
  const gauges: Partial<Record<GaugeRole, string>> = {};

  for (const role of GAUGE_ROLES) {
    const changed = change.gauges?.[role];
    const id = changed === undefined ? current.gauges[role] : changed;

    if (id !== undefined && id !== null) gauges[role] = id;
  }

  return {
    theme: change.theme ?? current.theme,
    language: change.language ?? current.language,
    brand: change.brand === undefined ? current.brand : change.brand,
    gauges,
  };
}
