import { ConnectorError, type Connector, type PickManyField } from '@deskorama/core';
import { createFakeClock, createFakeFetch, FIXTURE_TIME } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createSettingsService } from '../src/main/settings-window/create-settings-service.ts';
import { createSourceRuntime } from '../src/main/sources/create-source-runtime.ts';
import type { SourceEntry } from '../src/main/sources/source-entry.ts';
import type { SourceDraft } from '../src/shared/source-draft.ts';
import { ABOUT_FIXTURE } from './about-fixture.ts';
import { memoryStores } from './memory-stores.ts';

/** The projects the fictional service lists for the token "team-token", and for no other. */
const PROJECTS = [
  { value: 'prj_web', label: 'tramlo-web' },
  { value: 'prj_api', label: 'tramlo-api' },
];

/** A Connector that lists, and the tokens it was asked with. */
interface ListingConnector {
  readonly connector: Connector;
  readonly asked: string[];
}

/**
 * Returns a Connector with one field that holds several projects, which it lists for the token "team-token" and
 * refuses to any other for want of a permission, with the tokens it was asked with. Given `none`, picking no
 * project stands for all of them.
 * @example
 * const { connector, asked } = listingConnector();
 * listingConnector({ fr: 'Tous', en: 'All' }); // a Source of this one may pick no project
 */
function listingConnector(none?: PickManyField['none']): ListingConnector {
  const asked: string[] = [];

  const connector: Connector = {
    id: 'listing',
    title: { fr: 'Listant', en: 'Listing' },
    about: ABOUT_FIXTURE,
    config: {
      fields: [
        {
          key: 'projects',
          kind: 'pick-many',
          needs: [],
          formerly: 'project',
          label: { fr: 'Projets', en: 'Projects' },
          placeholder: 'tramlo-web',
          counted: {
            fr: { one: '1 projet', many: '{count} projets' },
            en: { one: '1 project', many: '{count} projects' },
          },
          ...(none === undefined ? {} : { none }),
        },
      ],
      permissions: [{ name: 'Team scope', why: { fr: 'Lister.', en: 'List.' } }],
      interval: { min: 30_000, default: 60_000, max: 600_000 },
    },
    gauges: {
      crowd: { max: 10, text: { fr: { label: 'a', short: 'A' }, en: { label: 'a', short: 'A' } } },
      daily: { text: { fr: { label: 'b', short: 'B' }, en: { label: 'b', short: 'B' } } },
      total: { text: { fr: { label: 'c', short: 'C' }, en: { label: 'c', short: 'C' } } },
    },
    poll: async (input) => ({ events: [], cursor: input.cursor }),
    async listOptions(input) {
      asked.push(input.settings.token);

      if (input.settings.token !== 'team-token') {
        throw new ConnectorError({ kind: 'permission', permission: 'Team scope' }, 'answered 403');
      }

      return PROJECTS;
    },
  };

  return { connector, asked };
}

const DRAFT: SourceDraft = {
  id: null,
  connector: 'listing',
  name: '',
  values: {},
  lists: { projects: [] },
  token: 'team-token',
  interval: null,
};

/**
 * Returns a settings service over in-memory stores and a listing Connector, starting on `sources`, and what a
 * test inspects.
 * @example
 * const { service, stores, saved } = setUp();
 * setUp([tramlo], { 'src-1': 'team-token' }, listingConnector({ fr: 'Tous', en: 'All' })); // none stands for all
 */
function setUp(
  sources: readonly SourceEntry[] = [],
  tokens: Record<string, string> = {},
  listing: ListingConnector = listingConnector(),
) {
  const clock = createFakeClock(FIXTURE_TIME);
  const stores = memoryStores(tokens);
  const { fetch } = createFakeFetch(() => ({ status: 200, body: {} }));
  const { connector, asked } = listing;
  let saved = sources;

  const base = { connectors: [connector], clock, fetch, ...stores };

  const runtime = createSourceRuntime({ ...base, onEvent: () => {}, onGauges: () => {}, onStates: () => {} });

  const service = createSettingsService({
    ...base,
    lang: () => 'en',
    runtime,
    readSources: () => saved,
    writeSources: (next) => void (saved = next),
    newId: () => 'src-new',
  });

  return { service, stores, asked, saved: () => saved };
}

describe('the lists of the connection sheet', () => {
  test('load with the token just typed, before the name or anything else is filled in, and save nothing', async () => {
    const { service, saved, stores } = setUp();

    expect(await service.listOptions(DRAFT, 'projects')).toEqual({ ok: true, options: PROJECTS });
    expect(saved()).toEqual([]);
    expect(stores.tokens.map.size).toBe(0);
  });

  test('load with the token in the Keychain for an edited Source that keeps it', async () => {
    const tramlo = { id: 'src-1', connector: 'listing', name: 'Tramlo', values: { project: 'tramlo-web' } };

    const { service, asked } = setUp([tramlo], { 'src-1': 'team-token' });

    expect(await service.listOptions({ ...DRAFT, id: 'src-1', token: '' }, 'projects')).toMatchObject({ ok: true });
    expect(asked).toEqual(['team-token']);
  });

  test('say which permission the token lacks when the service refuses to list', async () => {
    const { service } = setUp();

    expect(await service.listOptions({ ...DRAFT, token: 'project-token' }, 'projects')).toEqual({
      ok: false,
      failure: { kind: 'permission', permission: 'Team scope' },
    });
  });

  test('ask for a token first, and never the Connector for a field it lists nothing for', async () => {
    const { service, asked } = setUp();

    expect(await service.listOptions({ ...DRAFT, token: ' ' }, 'projects')).toEqual({
      ok: false,
      failure: { kind: 'auth' },
    });
    expect(await service.listOptions(DRAFT, 'name')).toEqual({ ok: false, failure: { kind: 'invalid-response' } });
    expect(await service.listOptions({ ...DRAFT, connector: 'gone' }, 'projects')).toEqual({
      ok: false,
      gone: 'connector',
    });
    expect(asked).toEqual([]);
  });
});

describe('a Source with a field that holds several', () => {
  test('is saved with each picked value once, and starts from no cursor when the picks change', () => {
    const { service, saved, stores } = setUp();

    const draft = { ...DRAFT, name: 'Tramlo', lists: { projects: ['prj_web', ' prj_api ', 'prj_web'] } };

    expect(service.save(draft)).toEqual({ ok: true });
    expect(saved()).toEqual([
      { id: 'src-new', connector: 'listing', name: 'Tramlo', values: {}, lists: { projects: ['prj_web', 'prj_api'] } },
    ]);

    stores.cursors.write('src-new', 'c7');
    service.save({ ...draft, id: 'src-new', token: '', lists: { projects: ['prj_web'] } });

    expect(stores.cursors.read('src-new')).toBeNull();
    expect(service.snapshot().sources[0]?.lists).toEqual({ projects: ['prj_web'] });
  });

  test('saved before the field held several still passes, and needs one picked once it is edited to none', () => {
    const tramlo = { id: 'src-1', connector: 'listing', name: 'Tramlo', values: { project: 'tramlo-web' } };

    const { service } = setUp([tramlo], { 'src-1': 'team-token' });

    const kept = { ...DRAFT, id: 'src-1', name: 'Tramlo', token: '', values: tramlo.values, lists: undefined };

    expect(service.save(kept)).toEqual({ ok: true });
    expect(service.save({ ...kept, values: {}, lists: { projects: [] } })).toEqual({
      ok: false,
      problems: ['projects'],
    });
  });

  test('saved before the field held several keeps its cursor once its one value is kept as a list', () => {
    const tramlo = { id: 'src-1', connector: 'listing', name: 'Tramlo', values: { project: 'tramlo-web' } };

    const { service, stores, saved } = setUp([tramlo], { 'src-1': 'team-token' });

    stores.cursors.write('src-1', 'c7');

    const listed = { ...DRAFT, id: 'src-1', name: 'Tramlo', token: '', lists: { projects: ['tramlo-web'] } };

    expect(service.save(listed)).toEqual({ ok: true });
    expect(saved()).toEqual([
      { id: 'src-1', connector: 'listing', name: 'Tramlo', values: {}, lists: { projects: ['tramlo-web'] } },
    ]);
    expect(stores.cursors.read('src-1')).toBe('c7');
  });

  test('saved before lists existed keeps its cursor when renamed, its empty list spelled out as the sheet does', () => {
    const tramlo = { id: 'src-1', connector: 'listing', name: 'Tramlo', values: {} };
    const all = listingConnector({ fr: 'Tous', en: 'All' });

    const { service, stores } = setUp([tramlo], { 'src-1': 'team-token' }, all);

    stores.cursors.write('src-1', 'c7');

    const renamed = { ...DRAFT, id: 'src-1', name: 'Tramlo prod', token: '', lists: { projects: [] } };

    expect(service.save(renamed)).toEqual({ ok: true });
    expect(stores.cursors.read('src-1')).toBe('c7');
  });
});
