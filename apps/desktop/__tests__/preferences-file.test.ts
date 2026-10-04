import { describe, expect, test } from 'vitest';
import { DEFAULT_PREFERENCES } from '../src/shared/preferences.ts';
import { readPreferences } from '../src/main/scene/read-preferences.ts';
import { readSources } from '../src/main/sources/read-sources.ts';
import { withSettings } from '../src/main/with-settings.ts';

describe('the preferences in settings.json', () => {
  test('are the defaults when there is no file or it cannot be read', () => {
    expect(readPreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences('not json')).toEqual(DEFAULT_PREFERENCES);
  });

  test('read back what was written, next to the Sources and the Local webhook, which stay as they were', () => {
    const before =
      '{"localWebhook":{"port":5000},"sources":[{"id":"src-1","connector":"feed","name":"T","values":{}}]}';
    const preferences = { theme: 'aeroport', language: 'en', brand: 'src-1', gauges: { daily: 'src-1' } } as const;

    const after = withSettings(before, { ...preferences });

    expect(readPreferences(after)).toEqual(preferences);
    expect(readSources(after)).toHaveLength(1);
    expect(JSON.parse(after)).toMatchObject({ localWebhook: { port: 5000 } });
  });

  test('fall back one by one: a Theme not shipped, an unknown language or a bad Gauge Source loses only itself', () => {
    const file = JSON.stringify({
      theme: 'immeuble',
      language: 'de',
      brand: 'src-1',
      gauges: { crowd: 7, daily: 'src-2' },
    });

    expect(readPreferences(file)).toEqual({ ...DEFAULT_PREFERENCES, brand: 'src-1', gauges: { daily: 'src-2' } });
  });
});
