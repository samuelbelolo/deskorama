import type { ConnectorOption, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createSentry } from '../src/create-sentry.ts';
import { recorded, TRAMLO_PICKED, TRAMLO_SENTRY } from './tramlo-sentry.ts';

/**
 * Polls Sentry once with `settings`, through a fake `fetch` answering no issue, and returns the address asked.
 * @example
 * (await askedWith(TRAMLO_PICKED)).searchParams.getAll('project'); // ['tramlo-web', 'tramlo-api']
 */
async function askedWith(settings: SourceSettings): Promise<URL> {
  const fake = createFakeFetch(inOrder([{ status: 200, body: [] }]));

  await createSentry().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME });

  return new URL(fake.sent[0]?.url ?? '');
}

/**
 * Loads the options of one field of Tramlo's Sentry, through a fake `fetch` answering `recordings` in order, and
 * returns them with the requests sent.
 * @example
 * const { options, sent } = await listOf('projects', [recorded('projects.json')]);
 * // options: [{ value: 'tramlo-api', label: 'tramlo-api' }, …], sent: [the request to …/organizations/tramlo/projects/]
 */
async function listOf(
  field: string,
  recordings: readonly RecordedResponse[],
): Promise<{ options: readonly ConnectorOption[]; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder(recordings));

  const input = { field, settings: TRAMLO_SENTRY, fetch: fake.fetch, now: FIXTURE_TIME };

  const options = (await createSentry().listOptions?.(input)) ?? [];

  return { options, sent: fake.sent };
}

describe('the Sentry Connector with picked projects and environments', () => {
  test('reads only the issues of the picked projects and environments, each named once', async () => {
    const asked = await askedWith(TRAMLO_PICKED);

    expect(asked.pathname).toBe('/api/0/organizations/tramlo/issues/');
    expect(asked.searchParams.getAll('project')).toEqual(['tramlo-web', 'tramlo-api']);
    expect(asked.searchParams.getAll('environment')).toEqual(['production', 'staging']);
  });

  test('reads every project and environment of a Source that picked none, as one saved before could not', async () => {
    const asked = await askedWith(TRAMLO_SENTRY);

    expect(asked.searchParams.has('project')).toBe(false);
    expect(asked.searchParams.has('environment')).toBe(false);
  });

  test('filters on one kind without the other', async () => {
    const asked = await askedWith({ ...TRAMLO_SENTRY, lists: { projects: [], environments: ['production'] } });

    expect(asked.searchParams.has('project')).toBe(false);
    expect(asked.searchParams.getAll('environment')).toEqual(['production']);
  });
});

describe('what the Sentry Connector lists', () => {
  test('the organizations the token can see, by name, each kept by its slug', async () => {
    const { options, sent } = await listOf('organization', [recorded('organizations.json')]);

    expect(sent[0]?.url).toBe('https://sentry.io/api/0/organizations/?per_page=100');
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer tramlo-sentry-token-for-tests' });
    expect(options).toEqual([
      { value: 'kavelo-labs', label: 'Kavelo Labs' },
      { value: 'tramlo', label: 'Tramlo' },
    ]);
  });

  test('the projects of the chosen organization, by slug', async () => {
    const { options, sent } = await listOf('projects', [recorded('projects.json')]);

    expect(sent[0]?.url).toBe('https://sentry.io/api/0/organizations/tramlo/projects/?per_page=100');
    expect(options.map((option) => option.value)).toEqual(['tramlo-api', 'tramlo-mobile', 'tramlo-web']);
  });

  test('the environments of the chosen organization, leaving out the one with no name', async () => {
    const { options, sent } = await listOf('environments', [recorded('environments.json')]);

    expect(sent[0]?.url).toBe('https://sentry.io/api/0/organizations/tramlo/environments/?per_page=100');
    expect(options.map((option) => option.value)).toEqual(['preview', 'production', 'staging']);
  });

  test('a long list page after page, as Sentry’s Link header says', async () => {
    const link =
      '<https://sentry.io/api/0/organizations/tramlo/projects/?cursor=0:100:0>; rel="next"; results="true"; cursor="0:100:0"';

    const { options, sent } = await listOf('projects', [
      { status: 200, headers: { Link: link }, body: [{ slug: 'tramlo-web' }] },
      { status: 200, body: [{ slug: 'tramlo-api' }] },
    ]);

    expect(new URL(sent[1]?.url ?? '').searchParams.get('cursor')).toBe('0:100:0');
    expect(options.map((option) => option.value)).toEqual(['tramlo-api', 'tramlo-web']);
  });

  test('five pages at most of a list whose Link header always says there are more', async () => {
    const link =
      '<https://sentry.io/api/0/organizations/tramlo/projects/?cursor=0:100:0>; rel="next"; results="true"; cursor="0:100:0"';

    const fake = createFakeFetch(() => ({ status: 200, headers: { Link: link }, body: [{ slug: 'tramlo-web' }] }));

    const input = { field: 'projects', settings: TRAMLO_SENTRY, fetch: fake.fetch, now: FIXTURE_TIME };

    const options = await createSentry().listOptions?.(input);

    expect(fake.sent).toHaveLength(5);
    expect(options).toHaveLength(5);
  });

  test('nothing with a token that only reads issues, which names the scope it lacks', async () => {
    const refused = { status: 403, body: { detail: 'You do not have permission to perform this action.' } };

    await expect(listOf('organization', [refused])).rejects.toMatchObject({
      failure: { kind: 'permission', permission: 'org:read' },
    });
  });

  test('no project before the organization is known, and sends nothing', async () => {
    const fake = createFakeFetch(inOrder([]));

    const input = {
      field: 'projects',
      settings: { ...TRAMLO_SENTRY, values: {} },
      fetch: fake.fetch,
      now: FIXTURE_TIME,
    };

    await expect(createSentry().listOptions?.(input)).rejects.toMatchObject({ failure: { kind: 'invalid-response' } });
    expect(fake.sent).toEqual([]);
  });
});
