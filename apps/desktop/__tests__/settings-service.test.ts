import { createFeed } from '@deskorama/connector-feed';
import { createFakeClock, createFakeFetch, FIXTURE_TIME, type RecordedResponse } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import type { SourceDraft } from '../src/shared/settings-bridge.ts';
import { createSettingsService } from '../src/main/settings-window/create-settings-service.ts';
import { createSourceRuntime } from '../src/main/sources/create-source-runtime.ts';
import type { SourceEntry } from '../src/main/sources/source-entry.ts';
import { memoryStores } from './memory-stores.ts';
import { settle } from './settle.ts';

const URL = 'https://api.tramlo.example/deskorama/events';

const DRAFT: SourceDraft = { id: null, connector: 'feed', name: 'Tramlo', values: { url: URL }, token: 'feed-token-1' };

/** A page of the Tramlo Feed with two Events, oldest first. */
const PAGE: RecordedResponse = {
  status: 200,
  body: {
    events: [
      { id: 'e1', kind: 'signup', archetype: 'arrival', source: 'Tramlo', text: { en: { label: 'New sign-up' } } },
      {
        id: 'e2',
        kind: 'paid',
        archetype: 'money',
        source: 'Tramlo',
        text: { fr: { label: 'Paiement reçu', detail: 'Annuel' } },
      },
    ],
    next_cursor: 'c2',
    has_more: false,
  },
};

/**
 * Returns a settings service over in-memory stores, a Feed answered by `respond`, and what a test inspects.
 * @example
 * const { service, stores, saved } = setUp(() => PAGE);
 */
function setUp(respond: () => RecordedResponse) {
  const clock = createFakeClock(FIXTURE_TIME);
  const stores = memoryStores();
  const fake = createFakeFetch(respond);
  let saved: readonly SourceEntry[] = [];
  let ids = 0;

  const runtime = createSourceRuntime({
    connectors: [createFeed()],
    clock,
    fetch: fake.fetch,
    ...stores,
    onEvent: () => {},
    onGauges: () => {},
    onStates: () => {},
  });

  const service = createSettingsService({
    lang: 'fr',
    connectors: [createFeed()],
    runtime,
    ...stores,
    clock,
    fetch: fake.fetch,
    readSources: () => saved,
    writeSources: (sources) => void (saved = sources),
    newId: () => `src-${++ids}`,
  });

  return { service, stores, fake, saved: () => saved };
}

describe('the settings window', () => {
  test('adds a Source: its token to the Keychain, the rest to the settings file, and starts polling it', async () => {
    const { service, stores, saved, fake } = setUp(() => PAGE);

    expect(service.save(DRAFT)).toEqual({ ok: true });
    await settle();

    expect(saved()).toEqual([{ id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: URL } }]);
    expect(JSON.stringify(saved())).not.toContain('feed-token-1');
    expect(stores.tokens.map.get('src-1')).toBe('feed-token-1');
    expect(fake.sent).toHaveLength(1);
    expect(service.snapshot().sources[0]).toMatchObject({ name: 'Tramlo', status: { state: 'ok' } });
  });

  test('names the fields to fix and saves nothing', () => {
    const { service, saved, stores } = setUp(() => PAGE);

    expect(service.save({ ...DRAFT, name: ' ', values: { url: 'http://api.tramlo.example' }, token: '' })).toEqual({
      ok: false,
      problems: ['name', 'url', 'token'],
    });
    expect(saved()).toEqual([]);
    expect(stores.tokens.map.size).toBe(0);
  });

  test('keeps the token when an edit leaves it empty, and starts a new address from no cursor', () => {
    const { service, stores } = setUp(() => PAGE);

    service.save(DRAFT);
    stores.cursors.write('src-1', 'c2');

    service.save({ ...DRAFT, id: 'src-1', name: 'Tramlo prod', token: '' });
    expect(stores.tokens.map.get('src-1')).toBe('feed-token-1');
    expect(stores.cursors.read('src-1')).toBe('c2');

    service.save({ ...DRAFT, id: 'src-1', values: { url: `${URL}/v2` }, token: '' });
    expect(stores.cursors.read('src-1')).toBeNull();
  });

  test('removes a Source with its token and its cursor', () => {
    const { service, stores, saved } = setUp(() => PAGE);

    service.save(DRAFT);
    stores.cursors.write('src-1', 'c2');
    service.remove('src-1');

    expect(saved()).toEqual([]);
    expect(stores.tokens.map.has('src-1')).toBe(false);
    expect(stores.cursors.read('src-1')).toBeNull();
    expect(service.snapshot().sources).toEqual([]);
  });

  test('tests a draft without saving it, showing its latest Events newest first in the display language', async () => {
    const { service, saved, stores } = setUp(() => PAGE);

    expect(await service.test(DRAFT)).toEqual({
      ok: true,
      events: [
        { label: 'Paiement reçu', detail: 'Annuel', at: FIXTURE_TIME },
        { label: 'New sign-up', detail: '', at: FIXTURE_TIME },
      ],
    });
    expect(saved()).toEqual([]);
    expect(stores.tokens.map.size).toBe(0);
  });

  test('tests a draft whose token is refused and says so', async () => {
    const { service } = setUp(() => ({ status: 401 }));

    expect(await service.test(DRAFT)).toEqual({
      ok: false,
      problems: [],
      status: { state: 'failing', failure: { kind: 'auth' }, at: FIXTURE_TIME },
    });
  });

  test('refuses an edit of a Source that is gone, leaving the other Sources and their tokens alone', () => {
    const { service, stores, saved } = setUp(() => PAGE);

    service.save(DRAFT);

    expect(service.save({ ...DRAFT, id: 'src-gone', token: 'another-token' })).toEqual({
      ok: false,
      problems: ['source'],
    });
    expect(stores.tokens.map.get('src-1')).toBe('feed-token-1');
    expect(saved()).toHaveLength(1);
  });

  test('polls again a Source stopped on a refused token once a new token is saved', async () => {
    let answers = 0;
    const { service, fake } = setUp(() => (answers++ === 0 ? { status: 401 } : PAGE));

    service.save(DRAFT);
    await settle();

    expect(service.snapshot().sources[0]?.status).toMatchObject({ state: 'failing', failure: { kind: 'auth' } });

    service.save({ ...DRAFT, id: 'src-1', token: 'feed-token-2' });
    await settle();

    expect(fake.sent).toHaveLength(2);
    expect(fake.sent[1]?.init.headers['Authorization']).toBe('Bearer feed-token-2');
    expect(service.snapshot().sources[0]?.status).toMatchObject({ state: 'ok' });
  });
});
