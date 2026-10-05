import type { Language } from '@deskorama/core';
import type { SettingsSnapshot, SourceView } from '../../src/shared/settings-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { NOW } from './now.ts';

const MINUTE = 60_000;

/**
 * Returns what the window shows with the three fictional Sources connected, the "today" Gauge fed by Kavelo, and
 * one Event received by the Local webhook.
 * @example
 * connectedSnapshot('fr').sources.length; // 3
 */
export function connectedSnapshot(lang: Language): SettingsSnapshot {
  const empty = emptySnapshot(lang);

  return {
    ...empty,
    sources: connectedSources(lang),
    wallpaper: { ...empty.wallpaper, brand: 'src-tramlo', gauges: { crowd: null, daily: 'src-kavelo', total: null } },
    webhook: {
      ...empty.webhook,
      recent: [
        {
          label: lang === 'fr' ? 'Sauvegarde terminée' : 'Backup finished',
          detail: '',
          at: NOW - 4 * MINUTE,
          archetype: 'approval',
        },
      ],
    },
  };
}

/**
 * Returns three fictional Sources in `lang`: a private repository read a moment ago, a public one waiting for its
 * rate limit, and a Stripe account whose key lacks a permission.
 * @example
 * connectedSources('en')[2]?.name; // 'Kavelo'
 */
function connectedSources(lang: Language): SourceView[] {
  const fr = lang === 'fr';

  return [
    {
      id: 'src-tramlo',
      connector: 'github',
      name: 'Tramlo',
      values: { repository: 'tramlo/tramlo-app' },
      interval: null,
      status: { state: 'ok', at: NOW - 2 * MINUTE },
      last: {
        label: fr ? 'Pull request mergée' : 'Pull request merged',
        detail: '#418 Add PDF export for invoices',
        at: NOW - 2 * MINUTE,
        archetype: 'approval',
      },
    },
    {
      id: 'src-kit',
      connector: 'github-public',
      name: 'Tramlo Kit',
      values: { repository: 'tramlo/tramlo-kit' },
      interval: 120_000,
      status: { state: 'failing', failure: { kind: 'rate-limit', resetAt: NOW + 9 * MINUTE }, at: NOW - MINUTE },
      last: {
        label: fr ? 'Nouvelle étoile sur le dépôt' : 'New star on the repository',
        detail: '',
        at: NOW - 9 * MINUTE,
        archetype: 'like',
      },
    },
    {
      id: 'src-kavelo',
      connector: 'stripe',
      name: 'Kavelo',
      values: {},
      interval: null,
      status: {
        state: 'failing',
        failure: { kind: 'permission', permission: 'Subscriptions: Read' },
        at: NOW - 3 * MINUTE,
      },
      last: {
        label: fr ? 'Paiement reçu' : 'Payment received',
        detail: fr ? 'Formule annuelle' : 'Yearly plan',
        at: new Date(2026, 9, 3, 18, 40).getTime(),
        archetype: 'money',
      },
    },
  ];
}
