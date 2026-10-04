import type { SourceEvent } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createGithub } from '../src/create-github.ts';
import { answerFrom } from './answer-from.ts';
import { MINUTE, pollOnce } from './poll-once.ts';
import { recording } from './recording.ts';
import { firstPollOfApp, TRAMLO_APP, TRAMLO_APP_REPOSITORY, unchangedPollOfApp } from './tramlo-app.ts';

/**
 * Returns what a Theme and a reader see of an Event: its Role, rarity, step and words in both languages.
 * @example
 * seen(event); // { id: 'pr-412-merged', kind: 'pull_request.merged', archetype: 'approval', …, fr: { … }, en: { … } }
 */
function seen(event: SourceEvent) {
  return {
    id: event.id,
    kind: event.kind,
    archetype: event.archetype,
    rarity: event.rarity,
    step: event.step,
    fr: event.text.fr,
    en: event.text.en,
  };
}

/**
 * Returns the answers to the poll a minute after the first one: two new commits, the running CI run gone red and
 * the production deploy failed; every list that did not change answers `304`.
 * @example
 * answerFrom(TRAMLO_APP_REPOSITORY, secondPollOfApp());
 */
function secondPollOfApp(): Record<string, RecordedResponse> {
  return {
    ...unchangedPollOfApp(),
    '/commits?per_page=50': recording('tramlo-app', 'commits-after-push.json'),
    '/actions/runs/5103': recording('tramlo-app', 'run-5103-failed.json'),
    '/deployments/62/statuses?per_page=10': recording('tramlo-app', 'statuses-62-failed.json'),
  };
}

describe('the GitHub Connector of a private repository', () => {
  test('maps each kind onto its Role, with its words in both languages and no author or other branch, oldest first', async () => {
    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    expect(result.events.map(seen)).toEqual([
      {
        id: 'review-9002',
        kind: 'review.changes_requested',
        archetype: 'rejection',
        rarity: 'common',
        step: undefined,
        fr: { label: 'Modifications demandées', detail: '#412 Add PDF export for invoices', tag: 'À REVOIR' },
        en: { label: 'Changes requested', detail: '#412 Add PDF export for invoices', tag: 'CHANGES' },
      },
      {
        id: 'pr-409-closed',
        kind: 'pull_request.closed',
        archetype: 'abandon',
        rarity: 'common',
        step: undefined,
        fr: { label: 'Pull request fermée sans merge', detail: '#409 Try another chart library', tag: 'FERMÉE' },
        en: { label: 'Pull request closed unmerged', detail: '#409 Try another chart library', tag: 'CLOSED' },
      },
      {
        id: 'release-77',
        kind: 'release.published',
        archetype: 'publish',
        rarity: 'notable',
        step: undefined,
        fr: { label: 'Nouvelle version publiée', detail: 'v2.5.0 : PDF export', tag: 'v2.5.0' },
        en: { label: 'New release published', detail: 'v2.5.0: PDF export', tag: 'v2.5.0' },
      },
      {
        id: 'deploy-61-started',
        kind: 'deployment.started',
        archetype: 'deploy',
        rarity: 'common',
        step: 'started',
        fr: { label: 'Déploiement lancé', detail: 'production : v2.5.0', tag: 'production' },
        en: { label: 'Deploy started', detail: 'production: v2.5.0', tag: 'production' },
      },
      {
        id: 'deploy-61-succeeded',
        kind: 'deployment.succeeded',
        archetype: 'deploy',
        rarity: 'notable',
        step: 'succeeded',
        fr: { label: 'Déploiement réussi', detail: 'production : v2.5.0', tag: 'production' },
        en: { label: 'Deploy succeeded', detail: 'production: v2.5.0', tag: 'production' },
      },
      {
        id: 'issue-421-opened',
        kind: 'issue.opened',
        archetype: 'message',
        rarity: 'notable',
        step: undefined,
        fr: { label: 'Issue ouverte', detail: '« The Export button does nothing »', tag: '#421' },
        en: { label: 'Issue opened', detail: '“The Export button does nothing”', tag: '#421' },
      },
      {
        id: 'pr-412-merged',
        kind: 'pull_request.merged',
        archetype: 'approval',
        rarity: 'notable',
        step: undefined,
        fr: { label: 'Pull request mergée', detail: '#412 Add PDF export for invoices', tag: 'MERGÉE' },
        en: { label: 'Pull request merged', detail: '#412 Add PDF export for invoices', tag: 'MERGED' },
      },
      {
        id: 'pr-418-opened',
        kind: 'pull_request.opened',
        archetype: 'arrival',
        rarity: 'common',
        step: undefined,
        fr: { label: 'Pull request ouverte', detail: '#418 Fix Google sign-in', tag: '#418' },
        en: { label: 'Pull request opened', detail: '#418 Fix Google sign-in', tag: '#418' },
      },
      {
        id: 'run-5102-1-failed',
        kind: 'ci.failed',
        archetype: 'error',
        rarity: 'common',
        step: undefined,
        fr: { label: 'CI en échec', detail: 'CI sur une branche', tag: 'CI' },
        en: { label: 'CI failed', detail: 'CI on a branch', tag: 'CI' },
      },
      {
        id: 'review-9001',
        kind: 'review.approved',
        archetype: 'like',
        rarity: 'notable',
        step: undefined,
        fr: { label: 'Revue approuvée', detail: '#418 Fix Google sign-in', tag: 'LGTM' },
        en: { label: 'Review approved', detail: '#418 Fix Google sign-in', tag: 'LGTM' },
      },
      {
        id: 'deploy-62-started',
        kind: 'deployment.started',
        archetype: 'deploy',
        rarity: 'common',
        step: 'started',
        fr: { label: 'Déploiement lancé', detail: 'production : c3c3c3c', tag: 'production' },
        en: { label: 'Deploy started', detail: 'production: c3c3c3c', tag: 'production' },
      },
    ]);
  });

  test('counts contributors active in the last hour and open issues without pull requests, never stars', async () => {
    const { result, sent } = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()),
    );

    expect(result.gauges).toEqual({ crowd: 5, total: 37 });
    expect(result.events.some((event) => event.kind.startsWith('star'))).toBe(false);
    expect(sent.every((request) => !request.url.includes('stargazers'))).toBe(true);
  });

  test('asks with a read-only token and the API version, through the resource lists and never the Events API', async () => {
    const { sent } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    expect(sent[0]?.url).toBe('https://api.github.com/repos/tramlo/tramlo-app');
    expect(sent[0]?.init.headers).toMatchObject({
      Authorization: 'Bearer github_pat_tramlo_app_for_tests',
      'X-GitHub-Api-Version': '2026-03-10',
    });
    expect(sent.some((request) => request.url.includes('/events'))).toBe(false);
  });

  test('sends the ETags back, and a list that did not change brings nothing', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, { ...unchangedPollOfApp(), '/actions/runs/5103': { status: 304 } }),
      first.result.cursor,
      MINUTE,
    );

    const pulls = second.sent.find((request) =>
      request.url.endsWith('/pulls?state=all&sort=updated&direction=desc&per_page=30'),
    );

    expect(pulls?.init.headers['If-None-Match']).toBe('"tramlo-app/pulls.json"');
    expect(second.result.events).toEqual([]);
    expect(second.result.gauges).toEqual({ crowd: 5, total: 37 });
  });

  test('turns new commits on the default branch into one push that raises today’s commits', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, secondPollOfApp()),
      first.result.cursor,
      MINUTE,
    );

    const push = second.result.events.find((event) => event.kind === 'push');

    expect(push?.archetype).toBe('usage');
    expect(push?.gauge).toEqual({ role: 'daily', by: 2 });
    expect(push?.text.fr).toEqual({ label: 'Commits poussés sur main', detail: '2 commits sur main', tag: '+2' });
    expect(push?.text.en).toEqual({ label: 'Commits pushed to main', detail: '2 commits on main', tag: '+2' });
  });

  test('reads unfinished runs and deploys again by id until they finish, so going red is never missed', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, secondPollOfApp()),
      first.result.cursor,
      MINUTE,
    );

    expect(second.result.events.map((event) => [event.id, event.step])).toEqual([
      ['push-c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5', undefined],
      ['run-5103-1-failed', undefined],
      ['deploy-62-failed', 'failed'],
    ]);

    const third = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, unchangedPollOfApp()),
      second.result.cursor,
      2 * MINUTE,
    );

    expect(third.sent.some((request) => request.url.includes('/actions/runs/5103'))).toBe(false);
    expect(third.sent.some((request) => request.url.includes('/deployments/62/'))).toBe(false);
  });

  test('keeps a red run’s id when the list and a read by id both show it', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const ids = first.result.events.map((event) => event.id);

    expect(ids.filter((id) => id === 'run-5102-1-failed')).toHaveLength(1);
  });
});
