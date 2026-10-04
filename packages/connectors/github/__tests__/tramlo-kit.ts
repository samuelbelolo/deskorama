import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';
import { recording } from './recording.ts';

/** Tramlo Kit, the team's public open-source library, as a person connects it. */
export const TRAMLO_KIT: SourceSettings = {
  name: 'Tramlo Kit',
  values: { repository: 'https://github.com/tramlo/tramlo-kit' },
  token: 'github_pat_tramlo_kit_for_tests',
};

/** Its full name on GitHub. */
export const TRAMLO_KIT_REPOSITORY = 'tramlo/tramlo-kit';

/**
 * Returns a recording of Tramlo Kit.
 * @example
 * kit('pulls.json'); // { status: 200, body: [ … ], … }
 */
function kit(file: string): RecordedResponse {
  return recording('tramlo-kit', file);
}

/**
 * Returns the answers to a poll of Tramlo Kit: a first-time contributor's pull request and nothing else, with its
 * stars and forks as `repository` gives them.
 * @example
 * answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit('repository-later.json'));
 */
export function pollOfKit(repository = 'repository.json'): Record<string, RecordedResponse> {
  return {
    '': kit(repository),
    '/commits?per_page=50': kit('commits.json'),
    '/pulls?state=all&sort=updated&direction=desc&per_page=30': kit('pulls.json'),
    '/pulls/57/reviews?per_page=100': kit('reviews-57.json'),
    '/issues?state=all&sort=created&direction=desc&per_page=30': kit('issues.json'),
    '/releases?per_page=10': kit('releases.json'),
    '/actions/runs?per_page=30&exclude_pull_requests=true': kit('runs.json'),
    '/deployments?per_page=10': kit('deployments.json'),
  };
}
