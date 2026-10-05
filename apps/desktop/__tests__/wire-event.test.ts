import { createEngine, localiseEvent, type Recap } from '@deskorama/core';
import { createFakeHost, FIXTURE_TIME, sourceEventFixture, sourceProfileFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { fromWireEvent } from '../src/shared/from-wire-event.ts';
import { fromWireRecap } from '../src/shared/from-wire-recap.ts';
import { fromWireState } from '../src/shared/from-wire-state.ts';
import { toWireEvent } from '../src/shared/to-wire-event.ts';
import { toWireRecap } from '../src/shared/to-wire-recap.ts';
import { toWireState } from '../src/shared/to-wire-state.ts';

const DEPLOY = localiseEvent(
  sourceEventFixture({ id: 'tramlo-deploy-1', kind: 'deploy.finished', archetype: 'deploy', step: 'succeeded' }),
  'en',
);

describe('what crosses from the main process to a wallpaper page', () => {
  test('an Event crosses as plain data and comes back whole', () => {
    const wire = toWireEvent(DEPLOY);

    expect(wire.at).toBe(FIXTURE_TIME);
    expect(structuredClone(wire)).toEqual(wire);
    expect(fromWireEvent(structuredClone(wire))).toEqual(DEPLOY);
  });

  test('a recap crosses as plain data and comes back whole', () => {
    const recap: Recap = {
      from: new Date(FIXTURE_TIME),
      to: new Date(FIXTURE_TIME + 3_600_000),
      total: 3,
      groups: [{ archetype: 'deploy', rarity: 'notable', count: 2, latest: DEPLOY }],
      more: 1,
    };

    const wire = toWireRecap(recap);

    expect(JSON.parse(JSON.stringify(wire))).toEqual(wire);
    expect(fromWireRecap(structuredClone(wire))).toEqual(recap);
  });

  test('what every screen shares crosses as plain data and comes back whole', () => {
    const engine = createEngine(createFakeHost({ start: FIXTURE_TIME }), {
      lang: 'en',
      seed: 7,
      source: sourceProfileFixture(),
    });

    engine.setGauges({ crowd: 4 });
    engine.send(sourceEventFixture());
    engine.send(sourceEventFixture({ id: 'tramlo-deploy-1', archetype: 'deploy', step: 'succeeded' }));

    const state = engine.state();
    const wire = toWireState(state);

    expect(JSON.parse(JSON.stringify(wire))).toEqual(wire);
    expect(fromWireState(structuredClone(wire))).toEqual(state);
    expect(state.today.lastDeploy?.id).toBe('tramlo-deploy-1');
  });

  test('a day without a deploy crosses too', () => {
    const state = createEngine(createFakeHost(), { lang: 'en', seed: 7, source: sourceProfileFixture() }).state();

    expect(fromWireState(toWireState(state))).toEqual(state);
  });
});
