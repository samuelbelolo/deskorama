import type { ConnectorAbout } from '@deskorama/core';
import { GITHUB_MARK } from './github-mark.ts';
import type { Visibility } from './visibility.ts';

/**
 * Where a fine-grained token is created. The address presets its name and the five permissions GitHub lets a link
 * preset; Metadata comes with any of them. The repository cannot be preset, and one fixed address cannot name its
 * owner, so the note of a private repository says to pick both.
 */
const TOKEN_PAGE =
  'https://github.com/settings/personal-access-tokens/new?name=Deskorama&contents=read&pull_requests=read&issues=read&actions=read&deployments=read';

/**
 * Returns how a GitHub Connector presents itself: the same token page for both, with a note that says what to choose
 * there for a private repository and for a public one, and a dark tile for the first and a light one for the second,
 * so the two read apart in a list.
 * @example
 * githubAbout('public').pitch.en; // 'Merges, reviews, CI and releases, plus stars, forks and first-timers.'
 */
export function githubAbout(visibility: Visibility): ConnectorAbout {
  const isPrivate = visibility === 'private';

  return {
    logo: isPrivate
      ? { ...GITHUB_MARK, markColour: '#fbfbfb', tileColour: '#1f2328' }
      : { ...GITHUB_MARK, markColour: '#1f2328', tileColour: '#eceef1' },
    pitch: isPrivate
      ? {
          fr: 'Merges, revues, CI, versions, issues et déploiements.',
          en: 'Merges, reviews, CI runs, releases, issues and deploys.',
        }
      : {
          fr: 'Merges, revues, CI et versions, plus les étoiles, forks et nouveaux venus.',
          en: 'Merges, reviews, CI and releases, plus stars, forks and first-timers.',
        },
    token: {
      name: { fr: 'Jeton à granularité fine', en: 'Fine-grained token' },
      page: { site: 'GitHub', url: TOKEN_PAGE },
      note: isPrivate
        ? {
            fr: 'Un jeton à granularité fine\u00a0: mettez le propriétaire du dépôt en «\u00a0Resource owner\u00a0», choisissez «\u00a0Only select repositories\u00a0», puis ce seul dépôt.',
            en: 'A fine-grained token: pick the repository’s owner as “Resource owner”, choose “Only select repositories”, then this one repository.',
          }
        : {
            fr: 'Un jeton à granularité fine\u00a0: choisissez «\u00a0Public repositories\u00a0», un accès en lecture seule à tout dépôt public.',
            en: 'A fine-grained token: choose “Public repositories”, read-only access to any public repository.',
          },
    },
  };
}
