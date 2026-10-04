import { FIXTURE_TIME, type Responder } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createGithub } from '../src/create-github.ts';
import { answerFrom } from './answer-from.ts';
import { MINUTE, pollOnce } from './poll-once.ts';
import { recording } from './recording.ts';
import { firstPollOfApp, TRAMLO_APP, TRAMLO_APP_REPOSITORY, unchangedPollOfApp } from './tramlo-app.ts';

/** The pulls list of Tramlo's repository. */
const PULLS = '/pulls?state=all&sort=updated&direction=desc&per_page=30';

/** A link to a second page and a last one, as GitHub sends it. */
const NEXT_PAGE =
  '<https://api.github.com/repositories/700001/pulls?page=2>; rel="next", <https://api.github.com/repositories/700001/pulls?page=2>; rel="last"';

describe('the GitHub Connector catching up', () => {
  test('starts the next window from GitHub’s clock, so a Mac running fast skips nothing', async () => {
    const github = answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp());

    const dated: Responder = (request) => {
      const answer = github(request);

      return { ...answer, headers: { ...answer.headers, Date: new Date(FIXTURE_TIME).toUTCString() } };
    };

    const ahead = await pollOnce(createGithub(), TRAMLO_APP, dated, null, 10 * MINUTE);
    const undated = await pollOnce(createGithub(), TRAMLO_APP, github, null, 10 * MINUTE);

    expect(JSON.parse(ahead.result.cursor ?? '{}')).toMatchObject({ since: FIXTURE_TIME - 5 * MINUTE });
    expect(JSON.parse(undated.result.cursor ?? '{}')).toMatchObject({ since: FIXTURE_TIME + 5 * MINUTE });
  });

  test('reads the next page while the last one still ends on something new', async () => {
    const routes = {
      ...firstPollOfApp(),
      [PULLS]: recording('tramlo-app', 'pulls-busy.json', { Link: NEXT_PAGE }),
      [`${PULLS}&page=2`]: recording('tramlo-app', 'pulls-busy-2.json'),
      '/pulls/430/reviews?per_page=100': recording('tramlo-app', 'reviews-409.json'),
      '/pulls/429/reviews?per_page=100': recording('tramlo-app', 'reviews-409.json'),
      '/pulls/428/reviews?per_page=100': recording('tramlo-app', 'reviews-409.json'),
    };

    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, routes));

    const merged = result.events.filter((event) => event.kind === 'pull_request.merged').map((event) => event.id);

    expect(merged).toEqual(['pr-428-merged', 'pr-429-merged', 'pr-430-merged']);
  });

  test('reads the last page of reviews too, where GitHub lists the newest', async () => {
    const reviews = '/pulls/418/reviews?per_page=100';

    const routes = {
      ...firstPollOfApp(),
      [reviews]: recording('tramlo-app', 'reviews-418.json', { Link: NEXT_PAGE }),
      [`${reviews}&page=2`]: recording('tramlo-app', 'reviews-418-recent.json'),
    };

    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, routes));

    expect(result.events.map((event) => event.id)).toContain('review-9004');
  });

  test('plays a re-run that fails again as a new failure', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const routes = {
      ...unchangedPollOfApp(),
      '/actions/runs?per_page=30&exclude_pull_requests=true': recording('tramlo-app', 'runs-rerun.json'),
    };

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, routes),
      first.result.cursor,
      MINUTE,
    );

    expect(second.result.events.map((event) => event.id)).toEqual(['run-5102-2-failed']);
  });

  test('does not follow again a finished deployment listed again just after it ended', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const ended = {
      ...unchangedPollOfApp(),
      '/actions/runs/5103': { status: 304 },
      '/deployments/62/statuses?per_page=10': recording('tramlo-app', 'statuses-62-failed.json'),
    };

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, ended),
      first.result.cursor,
      MINUTE,
    );

    const listedAgain = {
      ...ended,
      '/deployments?per_page=10': recording('tramlo-app', 'deployments-later.json'),
      '/deployments/64/statuses?per_page=10': recording('tramlo-app', 'statuses-64.json'),
    };

    const third = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, listedAgain),
      second.result.cursor,
      2 * MINUTE,
    );

    const fourth = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, { ...ended, '/deployments/64/statuses?per_page=10': { status: 304 } }),
      third.result.cursor,
      3 * MINUTE,
    );

    // Deployment 62 comes back as replays the platform drops by id; what matters is that it is read in full once more
    // and then left alone.
    expect(third.result.events.map((event) => event.id)).toEqual([
      'deploy-62-started',
      'deploy-62-failed',
      'deploy-64-started',
    ]);
    expect(third.sent.find((request) => request.url.includes('/deployments/62/'))?.init.headers).not.toHaveProperty(
      'If-None-Match',
    );
    expect(fourth.sent.some((request) => request.url.includes('/deployments/62/'))).toBe(false);
    expect(fourth.sent.some((request) => request.url.includes('/deployments/64/'))).toBe(true);
  });

  test('dates a push after the previous poll, so a commit written yesterday and pushed today counts today', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const routes = {
      ...unchangedPollOfApp(),
      '/actions/runs/5103': { status: 304 },
      '/commits?per_page=50': recording('tramlo-app', 'commits-old-push.json'),
    };

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, routes),
      first.result.cursor,
      MINUTE,
    );

    const push = second.result.events.find((event) => event.kind === 'push');

    expect(push?.gauge).toEqual({ role: 'daily', by: 1 });
    expect(push?.at.toISOString()).toBe('2026-10-04T13:55:00.000Z');
  });

  test('reads an empty repository, which has no commit yet, without failing', async () => {
    const empty = { status: 409, body: { message: 'Git Repository is empty.' } };

    const routes = { ...firstPollOfApp(), '/commits?per_page=50': empty };

    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, routes));

    expect(result.events.length).toBeGreaterThan(0);
  });
});
