import { describe, expect, test } from 'vitest';
import { localiseEvent } from '../src/localise-event.ts';
import type { SourceEvent } from '../src/source-event.ts';

const deployFailed: SourceEvent = {
  id: 'tramlo-deploy-12',
  kind: 'deploy.failed',
  archetype: 'deploy',
  recognised: true,
  rarity: 'jackpot',
  source: 'Tramlo',
  at: new Date(Date.UTC(2026, 9, 4, 14)),
  text: {
    fr: { label: 'Mise en ligne échouée', detail: 'web, docs, admin', tag: 'ÉCHEC' },
    en: { label: 'Deploy failed', detail: 'web, docs, admin', tag: 'FAILED' },
  },
  step: 'failed',
};

describe('localising an Event', () => {
  test('hands over the fact, the detail and the tag of the display language', () => {
    const event = localiseEvent(deployFailed, 'en');
    expect(event.label).toBe('Deploy failed');
    expect(event.meta).toEqual({ detail: 'web, docs, admin', tag: 'FAILED', step: 'failed' });
    expect(localiseEvent(deployFailed, 'fr').label).toBe('Mise en ligne échouée');
  });

  test('keeps what does not depend on the language', () => {
    const event = localiseEvent(deployFailed, 'fr');
    expect(event).toMatchObject({ id: 'tramlo-deploy-12', archetype: 'deploy', rarity: 'jackpot', source: 'Tramlo' });
    expect(event.at.toISOString()).toBe('2026-10-04T14:00:00.000Z');
  });

  test('carries a Gauge move only when the Source sent one', () => {
    expect('gauge' in localiseEvent(deployFailed, 'fr')).toBe(false);
    const pushed = { ...deployFailed, gauge: { role: 'daily', by: 3 } } satisfies SourceEvent;
    expect(localiseEvent(pushed, 'fr').gauge).toEqual({ role: 'daily', by: 3 });
  });
});
