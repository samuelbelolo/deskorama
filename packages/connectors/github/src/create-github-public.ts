import type { Connector } from '@deskorama/core';
import { GITHUB_CONFIG } from './github-config.ts';
import { githubGauges } from './github-gauges.ts';
import { pollGithub } from './poll-github.ts';

/**
 * Returns the GitHub Connector for a public repository: everything a private one reports, plus stars, forks and
 * first-time contributors, with stars as its total.
 * @example
 * const github = createGithubPublic();
 * await github.poll({ settings: { name: 'Tramlo Kit', values: { repository: 'tramlo/tramlo-kit' }, token },
 *   cursor: null, fetch: net.fetch, now: clock.now() });
 */
export function createGithubPublic(): Connector {
  return {
    id: 'github-public',
    title: { fr: 'Dépôt GitHub public', en: 'Public GitHub repository' },
    config: GITHUB_CONFIG,
    gauges: githubGauges('public'),
    poll: (input) => pollGithub('public', input),
  };
}
