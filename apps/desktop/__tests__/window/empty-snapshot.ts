import { LOCAL_WEBHOOK_ABOUT } from '@deskorama/connector-local-webhook/about';
import type { Language } from '@deskorama/core';
import { CONNECTORS } from '../../src/main/connectors.ts';
import { connectorView } from '../../src/main/settings-window/connector-view.ts';
import type { SettingsSnapshot } from '../../src/shared/settings-snapshot.ts';
import { NOW } from './now.ts';

/**
 * Returns what the window shows on first run, in `lang`: every Connector the app offers, as it describes itself,
 * and no Source yet.
 * @example
 * emptySnapshot('fr').connectors.length; // 8
 */
export function emptySnapshot(lang: Language): SettingsSnapshot {
  const address = 'http://127.0.0.1:47213/events';

  return {
    lang,
    systemLang: lang,
    now: NOW,
    accent: null,
    connectors: CONNECTORS.map(connectorView),
    sources: [],
    wallpaper: {
      theme: 'aeroport',
      language: 'system',
      brand: null,
      gauges: { crowd: null, daily: null, total: null },
      login: { on: true, needsApproval: false },
    },
    webhook: {
      on: true,
      listening: true,
      address,
      example: `curl ${address} -H "Authorization: Bearer $DESKORAMA_SECRET" -H "Content-Type: application/json" -d '{"kind": "backup.done", "archetype": "approval", "source": "Mac", "text": {"${lang}": {"label": "${lang === 'fr' ? 'Sauvegarde terminée' : 'Backup finished'}"}}}'`,
      canRegenerate: true,
      recent: [],
      about: LOCAL_WEBHOOK_ABOUT,
    },
  };
}
