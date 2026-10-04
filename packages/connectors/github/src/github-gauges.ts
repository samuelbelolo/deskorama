import type { SourceProfile } from '@deskorama/core';
import type { Visibility } from './visibility.ts';

/** How many active contributors fill the scene. */
const CROWD_MAX = 14;

/** The crowd of a repository: people who pushed, opened or reviewed something in the last hour. */
const ACTIVE: SourceProfile['gauges']['crowd']['text'] = {
  fr: { label: 'Contributeurs actifs sur la dernière heure', short: 'ACTIFS' },
  en: { label: 'Contributors active in the last hour', short: 'ACTIVE' },
};

/** Commits pushed to the default branch since midnight. */
const COMMITS: SourceProfile['gauges']['daily'] = {
  text: {
    fr: { label: 'Commits aujourd’hui', short: 'COMMITS' },
    en: { label: 'Commits today', short: 'COMMITS' },
  },
};

/**
 * Returns the words of a repository's Gauges: contributors active in the last hour and commits today for both,
 * then open issues for a private repository and stars for a public one.
 * @example
 * githubGauges('public').total.text.en; // { label: 'Repository stars', short: 'STARS' }
 */
export function githubGauges(visibility: Visibility): SourceProfile['gauges'] {
  const total: SourceProfile['gauges']['total'] =
    visibility === 'private'
      ? { text: { fr: { label: 'Issues ouvertes', short: 'ISSUES' }, en: { label: 'Open issues', short: 'ISSUES' } } }
      : {
          text: {
            fr: { label: 'Étoiles du dépôt', short: 'ÉTOILES' },
            en: { label: 'Repository stars', short: 'STARS' },
          },
        };

  return { crowd: { max: CROWD_MAX, text: ACTIVE }, daily: COMMITS, total };
}
