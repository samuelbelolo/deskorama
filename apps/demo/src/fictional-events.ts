import type { SourceEvent } from '@deskorama/core';

/** One fictional Event, without the fields the demo fills in when it sends it (id and time). */
export type FictionalEvent = Omit<SourceEvent, 'id' | 'at'>;

/** The fictional Source of the demo: a private GitHub repository that does not exist. */
const FICTIONAL_SOURCE = 'Tramlo';

/**
 * Events of Tramlo, a fictional private repository, some moving its Gauges or its build state, plus one from a
 * foreign Source and one of a kind nobody described. Every name, number and branch is invented; details never name a person.
 */
export const FICTIONAL_EVENTS: readonly FictionalEvent[] = [
  {
    kind: 'pull_request.merged',
    archetype: 'approval',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Pull request mergée', detail: '#418 Corrige la connexion Google', tag: 'MERGÉE' },
      en: { label: 'Pull request merged', detail: '#418 Fixes Google sign-in', tag: 'MERGED' },
    },
  },
  {
    kind: 'push.main',
    archetype: 'usage',
    recognised: true,
    rarity: 'common',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Commits poussés sur main', detail: '3 commits sur main', tag: '+3' },
      en: { label: 'Commits pushed to main', detail: '3 commits on main', tag: '+3' },
    },
    gauge: { role: 'daily', by: 3 },
  },
  {
    kind: 'ci.failed',
    archetype: 'error',
    recognised: true,
    rarity: 'common',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'CI en échec', detail: 'Tests de bout en bout sur feature/dark-mode', tag: 'CI' },
      en: { label: 'CI failed', detail: 'End-to-end tests on feature/dark-mode', tag: 'CI' },
    },
  },
  {
    kind: 'release.published',
    archetype: 'publish',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Nouvelle version publiée', detail: 'v2.5.0 avec l’export PDF', tag: 'v2.5.0' },
      en: { label: 'New release published', detail: 'v2.5.0 with PDF export', tag: 'v2.5.0' },
    },
  },
  {
    kind: 'secret.blocked',
    archetype: 'blocked',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Push bloqué : secret détecté', detail: 'Clé d’API dans config/prod.env', tag: 'SECRET' },
      en: { label: 'Push blocked: secret detected', detail: 'API key in config/prod.env', tag: 'SECRET' },
    },
  },
  {
    kind: 'merges.milestone',
    archetype: 'celebration',
    recognised: true,
    rarity: 'rare',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Cap des 1 000 pull requests mergées', detail: 'Depuis la création du dépôt', tag: '1 000' },
      en: { label: '1,000 pull requests merged', detail: 'Since the repository was created', tag: '1,000' },
    },
  },
  {
    kind: 'pull_request.opened',
    archetype: 'arrival',
    recognised: true,
    rarity: 'common',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Pull request ouverte', detail: '#421 Accélère la recherche', tag: '#421' },
      en: { label: 'Pull request opened', detail: '#421 Speeds up search', tag: '#421' },
    },
    gauge: { role: 'crowd', by: 1 },
  },
  {
    kind: 'issue.opened',
    archetype: 'message',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Issue ouverte', detail: '#97 L’export PDF coupe les tableaux', tag: '#97' },
      en: { label: 'Issue opened', detail: '#97 PDF export cuts tables in half', tag: '#97' },
    },
    gauge: { role: 'total', by: 1 },
  },
  {
    kind: 'deploy.started',
    archetype: 'deploy',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Mise en ligne lancée', detail: 'web, docs, admin', tag: 'v2.5.0' },
      en: { label: 'Deploy started', detail: 'web, docs, admin', tag: 'v2.5.0' },
    },
    step: 'started',
  },
  {
    kind: 'deploy.succeeded',
    archetype: 'deploy',
    recognised: true,
    rarity: 'notable',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Mise en ligne réussie', detail: 'web, docs, admin', tag: 'v2.5.0' },
      en: { label: 'Deploy succeeded', detail: 'web, docs, admin', tag: 'v2.5.0' },
    },
    step: 'succeeded',
  },
  {
    kind: 'mail.received',
    archetype: null,
    recognised: true,
    rarity: 'common',
    source: 'Mail',
    text: {
      fr: { label: 'E-mail reçu', detail: 'Comptabilité : « Facture d’octobre »', tag: '' },
      en: { label: 'E-mail received', detail: 'Accounting: “October invoice”', tag: '' },
    },
  },
  {
    kind: 'discussion.created',
    archetype: null,
    recognised: false,
    rarity: 'common',
    source: FICTIONAL_SOURCE,
    text: {
      fr: { label: 'Événement non reconnu', detail: 'discussion.created', tag: '' },
      en: { label: 'Unrecognised event', detail: 'discussion.created', tag: '' },
    },
  },
];
