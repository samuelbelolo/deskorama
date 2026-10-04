import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';
import { recording } from './recording.ts';

/** Tramlo's private application repository, as a person connects it. */
export const TRAMLO_APP: SourceSettings = {
  name: 'Tramlo',
  values: { repository: 'tramlo/tramlo-app' },
  token: 'github_pat_tramlo_app_for_tests',
};

/** Its full name on GitHub. */
export const TRAMLO_APP_REPOSITORY = 'tramlo/tramlo-app';

/**
 * Returns a recording of Tramlo's private repository.
 * @example
 * app('pulls.json'); // { status: 200, body: [ … ], … }
 */
function app(file: string): RecordedResponse {
  return recording('tramlo-app', file);
}

/**
 * Returns the answers to a first poll of Tramlo's private repository, in the morning of the fixture's day: merges,
 * reviews, a red CI run and one still going, an issue, a release, a finished deploy, one under way and a preview.
 * @example
 * answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp());
 */
export function firstPollOfApp(): Record<string, RecordedResponse> {
  return {
    '': app('repository.json'),
    '/commits?per_page=50': app('commits.json'),
    '/pulls?state=all&sort=updated&direction=desc&per_page=30': app('pulls.json'),
    '/pulls/418/reviews?per_page=100': app('reviews-418.json'),
    '/pulls/412/reviews?per_page=100': app('reviews-412.json'),
    '/pulls/409/reviews?per_page=100': app('reviews-409.json'),
    '/issues?state=all&sort=created&direction=desc&per_page=30': app('issues.json'),
    '/releases?per_page=10': app('releases.json'),
    '/actions/runs?per_page=30&exclude_pull_requests=true': app('runs.json'),
    '/deployments?per_page=10': app('deployments.json'),
    '/deployments/62/statuses?per_page=10': app('statuses-62.json'),
    '/deployments/61/statuses?per_page=10': app('statuses-61.json'),
    '/pulls?state=open&per_page=1': recording('tramlo-app', 'open-pulls.json', {
      Link: '<https://api.github.com/repositories/700001/pulls?state=open&per_page=1&page=2>; rel="next", <https://api.github.com/repositories/700001/pulls?state=open&per_page=1&page=3>; rel="last"',
    }),
  };
}

/**
 * Returns the answers to a poll where nothing changed: every address of the first poll answers `304`.
 * @example
 * answerFrom(TRAMLO_APP_REPOSITORY, { ...unchangedPollOfApp(), '/actions/runs/5103': { status: 304 } });
 */
export function unchangedPollOfApp(): Record<string, RecordedResponse> {
  return Object.fromEntries(Object.keys(firstPollOfApp()).map((path) => [path, { status: 304 }]));
}
