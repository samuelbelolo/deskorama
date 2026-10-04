import type { Connector } from '@deskorama/core';
import { GITHUB_CONFIG } from './github-config.ts';
import { githubGauges } from './github-gauges.ts';
import { pollGithub } from './poll-github.ts';

/**
 * Returns the GitHub Connector for a private repository, the usual case at work: pushes, pull requests and their
 * reviews, CI runs, issues, releases and deployments, with open issues as its total. It never reads stars or forks.
 * @example
 * const github = createGithub();
 * await github.poll({ settings: { name: 'Tramlo', values: { repository: 'tramlo/tramlo-app' }, token },
 *   cursor: null, fetch: net.fetch, now: clock.now() });
 */
export function createGithub(): Connector {
  return {
    id: 'github',
    title: { fr: 'Dépôt GitHub privé', en: 'Private GitHub repository' },
    config: GITHUB_CONFIG,
    gauges: githubGauges('private'),
    poll: (input) => pollGithub('private', input),
  };
}
