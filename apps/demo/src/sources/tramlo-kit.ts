import { between } from './between.ts';
import type { DemoSource } from './demo-source.ts';
import { drawIssue } from './draw-issue.ts';
import { drawPullRequest } from './draw-pull-request.ts';
import { drawRelease } from './draw-release.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';
import { FIRST_CONTRIBUTIONS, REFERRERS, SPONSOR_AMOUNTS } from './tramlo-kit-words.ts';

/**
 * Tramlo Kit, the invented open-source library of the team behind Tramlo, in a public GitHub repository. Only a public
 * repository has stars, forks, sponsors and first-time contributors from outside, so only this Source sends them.
 * Every rate is invented, and details name pull requests, issues, versions and counts, never a person.
 */
export const TRAMLO_KIT: DemoSource = {
  id: 'github-oss',
  profile: {
    name: 'Tramlo Kit',
    gauges: {
      crowd: {
        max: 12,
        text: {
          fr: { label: 'Contributeurs actifs sur la dernière heure', short: 'ACTIFS' },
          en: { label: 'Contributors active in the last hour', short: 'ACTIVE' },
        },
      },
      daily: {
        text: {
          fr: { label: 'Visites du dépôt aujourd’hui', short: 'VISITES' },
          en: { label: 'Repository views today', short: 'VIEWS' },
        },
      },
      total: {
        text: {
          fr: { label: 'Étoiles du dépôt', short: 'ÉTOILES' },
          en: { label: 'Repository stars', short: 'STARS' },
        },
      },
    },
  },
  title: { fr: 'Dépôt GitHub open source', en: 'Open-source GitHub repository' },
  pitch: {
    fr: 'Un projet public branche son dépôt : étoiles, forks, contributions extérieures, sponsors.',
    en: 'A public project plugs in its repository: stars, forks, outside contributions, sponsors.',
  },
  // Contributors all over the world: a flatter day, busy evenings.
  hourly: [
    0.45, 0.35, 0.3, 0.3, 0.35, 0.45, 0.6, 0.8, 1.0, 1.1, 1.1, 1.1, 1.0, 1.1, 1.2, 1.3, 1.3, 1.3, 1.3, 1.4, 1.4, 1.2,
    0.9, 0.6,
  ],
  gauges: { crowdMedian: 3, dailyPerDay: 380, dailyByEvents: false, totalStart: 2418, totalDrift: 0.05 },
  deploys: {
    perDay: 0.6,
    firstHour: 9,
    lastHour: 20,
    failureChance: 0.03,
    buildMinutes: [2, 6],
    front: ['docs', 'playground', 'site'],
    back: ['registry', 'api', 'cdn'],
  },
  kinds: [
    {
      kind: 'star.added',
      archetype: 'like',
      rarity: 'common',
      perDay: 12,
      label: { fr: 'Nouvelle étoile sur le dépôt', en: 'New star on the repository' },
      draw: (random) => {
        const referrer = pick(random, REFERRERS);

        return drawn([referrer.fr, '+1'], [referrer.en, '+1'], { role: 'total', by: 1 });
      },
    },
    {
      kind: 'issue.opened',
      archetype: 'message',
      rarity: 'common',
      perDay: 9,
      label: { fr: 'Issue ouverte', en: 'Issue opened' },
      draw: (random) => drawIssue(random),
    },
    {
      kind: 'pull_request.opened',
      archetype: 'arrival',
      rarity: 'common',
      perDay: 6,
      label: { fr: 'Pull request ouverte', en: 'Pull request opened' },
      draw: (random) => drawPullRequest(random, null),
    },
    {
      kind: 'repository.forked',
      archetype: 'usage',
      rarity: 'common',
      perDay: 3,
      label: { fr: 'Dépôt forké', en: 'Repository forked' },
      draw: (random) => {
        const forks = between(random, 300, 340);

        return drawn([`${forks} forks au total`, 'FORK'], [`${forks} forks in total`, 'FORK']);
      },
    },
    {
      kind: 'review.changes_requested',
      archetype: 'rejection',
      rarity: 'common',
      perDay: 3,
      label: { fr: 'Modifications demandées', en: 'Changes requested' },
      draw: (random) => drawPullRequest(random, { fr: 'À REVOIR', en: 'CHANGES' }),
    },
    {
      kind: 'pull_request.closed',
      archetype: 'abandon',
      rarity: 'common',
      perDay: 3,
      label: { fr: 'Pull request fermée sans merge', en: 'Pull request closed unmerged' },
      draw: (random) => drawPullRequest(random, { fr: 'FERMÉE', en: 'CLOSED' }),
    },
    {
      kind: 'ci.failed',
      archetype: 'error',
      rarity: 'common',
      perDay: 3,
      bursty: true,
      label: { fr: 'CI en échec', en: 'CI failed' },
      draw: () => drawn(['Job tests : branche d’un contributeur', 'CI'], ['Job tests: a contributor’s branch', 'CI']),
    },
    {
      kind: 'pull_request.merged',
      archetype: 'approval',
      rarity: 'notable',
      perDay: 4,
      label: { fr: 'Pull request mergée', en: 'Pull request merged' },
      draw: (random) => drawPullRequest(random, { fr: 'MERGÉE', en: 'MERGED' }),
    },
    {
      kind: 'star.removed',
      archetype: 'departure',
      rarity: 'notable',
      perDay: 1.5,
      label: { fr: 'Une étoile retirée', en: 'A star removed' },
      draw: () =>
        drawn(['Le dépôt en perd une', '-1'], ['One fewer on the repository', '-1'], { role: 'total', by: -1 }),
    },
    {
      kind: 'spam.hidden',
      archetype: 'blocked',
      rarity: 'notable',
      perDay: 1,
      label: { fr: 'Commentaire de spam masqué', en: 'Spam comment hidden' },
      draw: (random) => {
        const issue = between(random, 380, 420);

        return drawn([`Sur l’issue #${issue}`, 'SPAM'], [`On issue #${issue}`, 'SPAM']);
      },
    },
    {
      kind: 'contributor.first',
      archetype: 'partner',
      rarity: 'notable',
      perDay: 0.8,
      label: { fr: 'Premier contributeur extérieur', en: 'First-time contributor' },
      draw: (random) => {
        const what = pick(random, FIRST_CONTRIBUTIONS);

        return drawn([`Première PR : ${what.fr}`, 'BIENVENUE'], [`First PR: ${what.en}`, 'WELCOME']);
      },
    },
    {
      kind: 'release.published',
      archetype: 'publish',
      rarity: 'notable',
      perDay: 0.4,
      label: { fr: 'Nouvelle version publiée', en: 'New release published' },
      draw: drawRelease,
    },
    {
      kind: 'sponsor.new',
      archetype: 'money',
      rarity: 'notable',
      perDay: 0.4,
      label: { fr: 'Nouveau sponsor', en: 'New sponsor' },
      draw: (random) => {
        const amount = pick(random, SPONSOR_AMOUNTS);

        return drawn([`${amount} $ par mois`, `+${amount} $`], [`$${amount} a month`, `+$${amount}`]);
      },
    },
    {
      kind: 'stars.milestone',
      archetype: 'celebration',
      rarity: 'rare',
      perDay: 0.15,
      label: { fr: 'Cap des 2 500 étoiles', en: '2,500 stars reached' },
      draw: () => drawn(['Le dépôt passe les 2 500 étoiles', '2 500'], ['The repository passes 2,500 stars', '2,500']),
    },
  ],
};
