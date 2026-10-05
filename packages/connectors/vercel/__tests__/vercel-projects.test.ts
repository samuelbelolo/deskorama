import type { ConnectorOption, PollResult, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createVercel } from '../src/create-vercel.ts';
import { listAnswer } from './deployment-answers.ts';
import { MINUTE } from './poll-times.ts';
import { recorded, TRAMLO_API, TRAMLO_PROJECTS, TRAMLO_VERCEL, TRAMLO_WEB } from './tramlo-vercel.ts';

/**
 * Polls Vercel once with `settings`, through a fake `fetch` answering `recordings` in order, and returns the result
 * with the requests sent.
 * @example
 * const { result, sent } = await pollOnce(TRAMLO_PROJECTS, [listAnswer([])]);
 */
async function pollOnce(
  settings: SourceSettings,
  recordings: readonly RecordedResponse[],
): Promise<{ result: PollResult; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder(recordings));

  const result = await createVercel().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME });

  return { result, sent: fake.sent };
}

/**
 * Loads the projects a token can see, through a fake `fetch` answering `recordings` in order, and returns them with
 * the requests sent.
 * @example
 * const { options } = await listProjects([recorded('projects.json')]);
 */
async function listProjects(
  recordings: readonly RecordedResponse[],
): Promise<{ options: readonly ConnectorOption[]; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder(recordings));

  const input = { field: 'projects', settings: TRAMLO_PROJECTS, fetch: fake.fetch, now: FIXTURE_TIME };

  const options = (await createVercel().listOptions?.(input)) ?? [];

  return { options, sent: fake.sent };
}

describe('the Vercel Connector with several projects', () => {
  test('asks for the deployments of every picked project in one request, by their IDs', async () => {
    const { sent } = await pollOnce(TRAMLO_PROJECTS, [listAnswer([])]);

    expect(sent).toHaveLength(1);
    expect(sent[0]?.url).toBe(
      `https://api.vercel.com/v7/deployments?projectIds=${TRAMLO_WEB}&projectIds=${TRAMLO_API}&since=${FIXTURE_TIME - 60 * MINUTE}&limit=20`,
    );
  });

  test('names the project of each Event in its detail', async () => {
    const list = listAnswer([
      {
        uid: 'dpl_api',
        name: 'tramlo-api',
        created: FIXTURE_TIME - 2 * MINUTE,
        readyState: 'ERROR',
        target: 'production',
      },
      {
        uid: 'dpl_web',
        name: 'tramlo-web',
        created: FIXTURE_TIME - 9 * MINUTE,
        readyState: 'READY',
        target: 'production',
      },
    ]);

    const { result } = await pollOnce(TRAMLO_PROJECTS, [list]);

    expect(result.events.map((event) => [event.kind, event.text.en.detail])).toEqual([
      ['deployment.succeeded', 'tramlo-web · main'],
      ['deployment.failed', 'tramlo-api · main'],
    ]);
  });

  test('still reads a Source saved for a single project, by the name it was typed with', async () => {
    const { sent } = await pollOnce(TRAMLO_VERCEL, [listAnswer([])]);

    expect(new URL(sent[0]?.url ?? '').searchParams.getAll('projectId')).toEqual(['tramlo-web']);
    expect(sent[0]?.url).not.toContain('projectIds');
  });

  test('filters on a single picked project as on a typed one', async () => {
    const settings = { ...TRAMLO_PROJECTS, lists: { projects: [TRAMLO_WEB] } };

    const { sent } = await pollOnce(settings, [listAnswer([])]);

    expect(new URL(sent[0]?.url ?? '').searchParams.getAll('projectId')).toEqual([TRAMLO_WEB]);
  });

  test('refuses more projects than one request can filter on, before any request', async () => {
    const projects = Array.from({ length: 21 }, (_, index) => `prj_fictional_${index}`);

    const fake = createFakeFetch(inOrder([]));

    const settings = { ...TRAMLO_PROJECTS, lists: { projects } };

    await expect(
      createVercel().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME }),
    ).rejects.toMatchObject({ failure: { kind: 'invalid-response' } });
    expect(fake.sent).toEqual([]);
  });
});

describe('the projects the Vercel Connector lists', () => {
  test('are those the token can see, by name, each kept by its ID', async () => {
    const { options, sent } = await listProjects([recorded('projects.json')]);

    expect(sent[0]?.url).toBe('https://api.vercel.com/v10/projects?limit=100');
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer tramlo-vercel-token-for-tests' });
    expect(options).toEqual([
      { value: TRAMLO_API, label: 'tramlo-api' },
      { value: 'prj_D0cTr4mLo0003FictionalEeFf', label: 'tramlo-docs' },
      { value: TRAMLO_WEB, label: 'tramlo-web' },
    ]);
  });

  test('are read page after page, from where Vercel says the next one starts', async () => {
    const first = {
      projects: [{ id: 'prj_web', name: 'tramlo-web' }],
      pagination: { count: 1, next: 'JBSWY3DPEHPK3PXP' },
    };

    const last = { projects: [{ id: 'prj_api', name: 'tramlo-api' }], pagination: { count: 1, next: null } };

    const { options, sent } = await listProjects([
      { status: 200, body: first },
      { status: 200, body: last },
    ]);

    expect(new URL(sent[1]?.url ?? '').searchParams.get('from')).toBe('JBSWY3DPEHPK3PXP');
    expect(options.map((option) => option.label)).toEqual(['tramlo-api', 'tramlo-web']);
  });

  test('are also read from the bare list Vercel once answered', async () => {
    const { options } = await listProjects([{ status: 200, body: [{ id: 'prj_web', name: 'tramlo-web' }] }]);

    expect(options).toEqual([{ value: 'prj_web', label: 'tramlo-web' }]);
  });

  test('cannot be loaded with a token limited to one project, which names the scope it lacks', async () => {
    const refused = { status: 403, body: { error: { code: 'forbidden', message: 'Not authorized' } } };

    await expect(listProjects([refused])).rejects.toMatchObject({
      failure: { kind: 'permission', permission: 'Team scope' },
    });
  });
});
