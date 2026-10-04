import type { SourceEvent } from '@deskorama/core';
import { expect, test } from 'vitest';
import { fromWireEvent } from '../src/shared/from-wire-event.ts';
import { toWireEvent } from '../src/shared/to-wire-event.ts';

const DEPLOY: SourceEvent = {
  id: 'tramlo-deploy-1',
  kind: 'deploy.finished',
  archetype: 'deploy',
  recognised: true,
  rarity: 'notable',
  source: 'Tramlo CI',
  at: new Date(Date.UTC(2026, 9, 4, 14)),
  text: {
    fr: { label: 'Déploiement réussi', detail: 'v2.5.0 en production', tag: 'v2.5.0' },
    en: { label: 'Deploy succeeded', detail: 'v2.5.0 in production', tag: 'v2.5.0' },
  },
  step: 'succeeded',
};

test('an Event crosses to a renderer as plain data and comes back whole', () => {
  const wire = toWireEvent(DEPLOY);
  expect(wire.at).toBe(Date.UTC(2026, 9, 4, 14));
  expect(structuredClone(wire)).toEqual(wire);
  expect(fromWireEvent(structuredClone(wire))).toEqual(DEPLOY);
});
