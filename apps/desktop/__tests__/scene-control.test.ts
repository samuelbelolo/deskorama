import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import type { Connector } from '@deskorama/core';
import { sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { DEFAULT_PREFERENCES, type Preferences } from '../src/shared/preferences.ts';
import { GAUGES_CHANNEL, PAUSED_CHANNEL, SCENE_CHANNEL } from '../src/shared/wallpaper-bridge.ts';
import { createSceneControl } from '../src/main/scene/create-scene-control.ts';
import type { SourceEntry } from '../src/main/sources/source-entry.ts';
import { scriptedConnector } from './scripted-connector.ts';

/**
 * Returns a Connector whose three Gauges are all worded `word`, so a test sees which Source words which Gauge.
 * @example
 * gaugeWords('stripe', 'PAYMENTS').gauges.daily.text.en.short; // "PAYMENTS"
 */
function gaugeWords(id: string, word: string): Connector {
  const text = { fr: { label: word, short: word }, en: { label: word, short: word } };

  return {
    ...scriptedConnector([]).connector,
    id,
    gauges: { crowd: { max: 10, text }, daily: { text }, total: { text } },
  };
}

const CONNECTORS = [gaugeWords('repo', 'COMMITS'), gaugeWords('shop', 'ORDERS')];

const TRAMLO: SourceEntry = { id: 'src-1', connector: 'repo', name: 'Tramlo', values: {} };
const BOUTIK: SourceEntry = { id: 'src-2', connector: 'shop', name: 'Boutik', values: {} };

/**
 * Returns a scene control over `sources`, a Mac set to French, and what it sent and saved.
 * @example
 * const { scene, saved } = setUp([TRAMLO]);
 * scene.scene().source.name; // "Tramlo"
 */
function setUp(sources: readonly SourceEntry[], preferences: Preferences = DEFAULT_PREFERENCES) {
  const sent: { channel: string; payload: unknown }[] = [];
  const saved: Preferences[] = [];

  const scene = createSceneControl({
    connectors: CONNECTORS,
    fallback: LOCAL_WEBHOOK_PROFILE,
    systemLanguages: ['fr-FR', 'en-GB'],
    preferences,
    sources,
    savePreferences: (next) => void saved.push(next),
    send: (channel, payload) => void sent.push({ channel, payload }),
  });

  const on = (channel: string): unknown[] =>
    sent.filter((message) => message.channel === channel).map((m) => m.payload);

  return { scene, sent, saved, on };
}

describe('the scene every wallpaper draws', () => {
  test('without any Source, is named after the Mac in the Mac’s language', () => {
    const { scene } = setUp([]);

    expect(scene.scene()).toEqual({ theme: 'aeroport', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE });
  });

  test('switches language when the person picks one, saves it, and redraws every wallpaper', () => {
    const { scene, saved, on } = setUp([TRAMLO]);

    scene.setPreferences({ language: 'en' });

    expect(scene.lang()).toBe('en');
    expect(saved).toEqual([{ ...DEFAULT_PREFERENCES, language: 'en' }]);
    expect(on(SCENE_CHANNEL)).toEqual([
      { theme: 'aeroport', lang: 'en', source: expect.objectContaining({ name: 'Tramlo' }) },
    ]);

    scene.setPreferences({ language: 'en' });

    expect(saved).toHaveLength(1);
  });

  test('is named after the first Source until the person picks another, then after that one', () => {
    const { scene } = setUp([TRAMLO, BOUTIK]);

    expect(scene.scene().source.name).toBe('Tramlo');
    expect(scene.scene().source.gauges.daily.text.en.short).toBe('COMMITS');

    scene.setPreferences({ brand: 'src-2' });

    expect(scene.scene().source.name).toBe('Boutik');
    expect(scene.scene().source.gauges.daily.text.en.short).toBe('ORDERS');
  });

  test('words each Gauge after the Source that feeds it, and shows only that Source’s values', () => {
    const { scene, on } = setUp([TRAMLO, BOUTIK]);

    scene.setGauges('src-2', { daily: 3 });
    scene.setGauges('src-1', { crowd: 4, daily: 12 });

    expect(on(GAUGES_CHANNEL)).toEqual([{ crowd: 4, daily: 12 }]);

    scene.setPreferences({ gauges: { daily: 'src-2' } });

    const { gauges } = scene.scene().source;

    expect([gauges.crowd.text.en.short, gauges.daily.text.en.short, gauges.total.text.en.short]).toEqual([
      'COMMITS',
      'ORDERS',
      'COMMITS',
    ]);

    // The new scene starts its Gauges over with the latest values of the Sources that now feed them.
    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ crowd: 4, daily: 3 });

    scene.setGauges('src-1', { daily: 40 });

    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ crowd: 4, daily: 3 });
  });

  test('passes on the build state whatever Source reports it', () => {
    const { scene, on } = setUp([TRAMLO, BOUTIK]);

    scene.setGauges('src-2', { build: 'building' });

    expect(on(GAUGES_CHANNEL)).toEqual([{ build: 'building' }]);
  });

  test('falls back to the remaining Source when the chosen brand is removed', () => {
    const { scene } = setUp([TRAMLO, BOUTIK], { ...DEFAULT_PREFERENCES, brand: 'src-2', gauges: { total: 'src-2' } });

    scene.setSources([TRAMLO]);

    expect(scene.scene().source.name).toBe('Tramlo');
    expect(scene.sources().total?.entry.id).toBe('src-1');
  });

  test('pauses every wallpaper and lets it play again, telling whoever listens', () => {
    const { scene, on } = setUp([]);
    let heard = 0;

    scene.onChange(() => (heard += 1));
    scene.setPaused(true);
    scene.setPaused(true);
    scene.setPaused(false);

    expect(on(PAUSED_CHANNEL)).toEqual([true, false]);
    expect(heard).toBe(2);
  });

  test('sends the new Source’s values when a Gauge moves between two Sources worded alike', () => {
    const other: SourceEntry = { ...TRAMLO, id: 'src-3', name: 'Tramlo docs' };
    const { scene, on } = setUp([TRAMLO, other]);

    scene.setGauges('src-1', { daily: 12 });
    scene.setGauges('src-3', { daily: 5 });
    scene.setPreferences({ gauges: { daily: 'src-3' } });

    expect(on(SCENE_CHANNEL)).toEqual([]);
    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ daily: 5 });

    scene.setPreferences({ gauges: { daily: null } });

    expect(scene.sources().daily?.entry.id).toBe('src-1');
    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ daily: 12 });
  });

  test('lets an Event move a Gauge only when its Source feeds that Gauge', () => {
    const { scene } = setUp([TRAMLO, BOUTIK], { ...DEFAULT_PREFERENCES, gauges: { daily: 'src-2' } });
    const sale = sourceEventFixture({ id: 'sale', gauge: { role: 'daily', by: 1 } });

    expect(scene.fromSource('src-2', sale).gauge).toEqual({ role: 'daily', by: 1 });
    expect(scene.fromSource('src-1', sale).gauge).toBeUndefined();
    expect(scene.fromSource(null, sale).gauge).toBeUndefined();
    expect(setUp([]).scene.fromSource(null, sale).gauge).toEqual({ role: 'daily', by: 1 });
  });

  test('keeps where production stands from deploy Events, for a new scene and after a test deploy', () => {
    const { scene, on } = setUp([TRAMLO]);

    scene.fromSource('src-1', sourceEventFixture({ id: 'd', archetype: 'deploy', step: 'failed' }));
    scene.setPreferences({ language: 'en' });

    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ build: 'error' });

    scene.restoreBuild();

    expect(on(GAUGES_CHANNEL).at(-1)).toEqual({ build: 'error' });
    expect(setUp([]).scene.fromSource(null, sourceEventFixture({ id: 'x' })).id).toBe('x');
  });
});
