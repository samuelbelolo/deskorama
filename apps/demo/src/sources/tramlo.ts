import { between } from './between.ts';
import type { DemoSource } from './demo-source.ts';
import { drawIssue } from './draw-issue.ts';
import { drawPullRequest } from './draw-pull-request.ts';
import { drawRelease } from './draw-release.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';
import { BRANCHES, JOBS, SECRETS, TEAMS } from './tramlo-words.ts';

/**
 * Tramlo, a private GitHub repository that does not exist: the usual case at work, so the demo opens on it. A private
 * repository has no stars, forks from strangers or sponsors, so it never sends them. Every rate is invented, and
 * details name pull requests, branches, versions and counts, never a person.
 */
export const TRAMLO: DemoSource = {
  id: 'github',
  profile: {
    name: 'Tramlo',
    gauges: {
      crowd: {
        max: 14,
        text: {
          fr: { label: 'Contributeurs actifs sur la dernière heure', short: 'ACTIFS' },
          en: { label: 'Contributors active in the last hour', short: 'ACTIVE' },
        },
      },
      daily: {
        text: {
          fr: { label: 'Commits aujourd’hui', short: 'COMMITS' },
          en: { label: 'Commits today', short: 'COMMITS' },
        },
      },
      total: {
        text: { fr: { label: 'Issues ouvertes', short: 'ISSUES' }, en: { label: 'Open issues', short: 'ISSUES' } },
      },
    },
  },
  title: { fr: 'Dépôt GitHub privé', en: 'Private GitHub repository' },
  pitch: {
    fr: 'Une équipe branche son dépôt privé : pull requests, revues, CI, versions. Pas d’étoiles : le dépôt n’est pas public.',
    en: 'A team plugs in its private repository: pull requests, reviews, CI, releases. No stars: the repository is not public.',
  },
  // Weekday working hours, quiet nights.
  hourly: [
    0.08, 0.05, 0.04, 0.04, 0.04, 0.06, 0.15, 0.4, 0.9, 1.5, 1.7, 1.6, 1.0, 1.3, 1.7, 1.7, 1.6, 1.4, 1.0, 0.7, 0.5, 0.4,
    0.25, 0.12,
  ],
  gauges: { crowdMedian: 4, dailyPerDay: 46, dailyByEvents: true, totalStart: 37, totalDrift: 0.03 },
  deploys: {
    perDay: 1.5,
    firstHour: 9,
    lastHour: 19,
    failureChance: 0.03,
    buildMinutes: [2, 6],
    front: ['web', 'docs', 'admin'],
    back: ['api', 'worker', 'cron'],
  },
  kinds: [
    {
      kind: 'push.main',
      archetype: 'usage',
      rarity: 'common',
      perDay: 14,
      label: { fr: 'Commits poussés sur main', en: 'Commits pushed to main' },
      draw: (random) => {
        const commits = between(random, 1, 6);
        const plural = commits > 1 ? 's' : '';
        const tag = `+${commits}`;

        return drawn([`${commits} commit${plural} sur main`, tag], [`${commits} commit${plural} on main`, tag], {
          role: 'daily',
          by: commits,
        });
      },
    },
    {
      kind: 'pull_request.opened',
      archetype: 'arrival',
      rarity: 'common',
      perDay: 9,
      label: { fr: 'Pull request ouverte', en: 'Pull request opened' },
      draw: (random) => drawPullRequest(random, null),
    },
    {
      kind: 'reaction.added',
      archetype: 'like',
      rarity: 'common',
      perDay: 8,
      label: { fr: 'Pouce levé sur une pull request', en: 'Thumbs-up on a pull request' },
      draw: (random) => drawPullRequest(random, { fr: '+1', en: '+1' }),
    },
    {
      kind: 'branch.deleted',
      archetype: 'departure',
      rarity: 'common',
      perDay: 6,
      label: { fr: 'Branche supprimée après merge', en: 'Branch deleted after merge' },
      draw: (random) => {
        const branch = pick(random, BRANCHES);

        return drawn([branch, 'BRANCHE'], [branch, 'BRANCH']);
      },
    },
    {
      kind: 'review.changes_requested',
      archetype: 'rejection',
      rarity: 'common',
      perDay: 5,
      label: { fr: 'Modifications demandées', en: 'Changes requested' },
      draw: (random) => drawPullRequest(random, { fr: 'À REVOIR', en: 'CHANGES' }),
    },
    {
      kind: 'ci.failed',
      archetype: 'error',
      rarity: 'common',
      perDay: 4,
      bursty: true,
      label: { fr: 'CI en échec', en: 'CI failed' },
      draw: (random) => {
        const job = pick(random, JOBS);
        const failures = between(random, 1, 4);
        const plural = failures > 1 ? 's' : '';

        return drawn(
          [`Job ${job.fr} : ${failures} échec${plural}`, 'CI'],
          [`Job ${job.en}: ${failures} failure${plural}`, 'CI'],
        );
      },
    },
    {
      kind: 'pull_request.closed',
      archetype: 'abandon',
      rarity: 'common',
      perDay: 2,
      label: { fr: 'Pull request fermée sans merge', en: 'Pull request closed unmerged' },
      draw: (random) => drawPullRequest(random, { fr: 'FERMÉE', en: 'CLOSED' }),
    },
    {
      kind: 'pull_request.merged',
      archetype: 'approval',
      rarity: 'notable',
      perDay: 7,
      label: { fr: 'Pull request mergée', en: 'Pull request merged' },
      draw: (random) => drawPullRequest(random, { fr: 'MERGÉE', en: 'MERGED' }),
    },
    {
      kind: 'review.approved',
      archetype: 'like',
      rarity: 'notable',
      perDay: 6,
      label: { fr: 'Revue approuvée', en: 'Review approved' },
      draw: (random) => drawPullRequest(random, { fr: 'LGTM', en: 'LGTM' }),
    },
    {
      kind: 'issue.opened',
      archetype: 'message',
      rarity: 'notable',
      perDay: 6,
      label: { fr: 'Issue ouverte', en: 'Issue opened' },
      draw: (random) => drawIssue(random, { role: 'total', by: 1 }),
    },
    {
      kind: 'secret.blocked',
      archetype: 'blocked',
      rarity: 'notable',
      perDay: 0.5,
      label: { fr: 'Push bloqué : secret détecté', en: 'Push blocked: secret detected' },
      draw: (random) => {
        const secret = pick(random, SECRETS);

        return drawn([secret.fr, 'SECRET'], [secret.en, 'SECRET']);
      },
    },
    {
      kind: 'release.published',
      archetype: 'publish',
      rarity: 'notable',
      perDay: 0.5,
      label: { fr: 'Nouvelle version publiée', en: 'New release published' },
      draw: drawRelease,
    },
    {
      kind: 'member.added',
      archetype: 'partner',
      rarity: 'notable',
      perDay: 0.3,
      label: { fr: 'Nouveau membre dans l’équipe', en: 'New team member' },
      draw: (random) => {
        const team = pick(random, TEAMS);

        return drawn([`Arrive dans l’équipe ${team.fr}`, 'BIENVENUE'], [`Joins the ${team.en} team`, 'WELCOME']);
      },
    },
    {
      kind: 'merges.milestone',
      archetype: 'celebration',
      rarity: 'rare',
      perDay: 0.15,
      label: { fr: 'Cap des 1 000 pull requests mergées', en: '1,000 pull requests merged' },
      draw: () => drawn(['Depuis la création du dépôt', '1 000'], ['Since the repository was created', '1,000']),
    },
  ],
};
