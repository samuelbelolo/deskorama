import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import type { SharedSnapshot } from '../src/shared-snapshot.ts';
import { BUILTIN, createManualHost, EXTERNAL, START } from './manual-host.ts';
import { screenRecorder } from './screen-recorder.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

const HOUR = 3_600_000;

/**
 * Mounts a recording Theme on two screens through an engine counting days in UTC, and keeps every state it tells.
 * @example
 * const { engine, states } = watched();
 * engine.setGauges({ crowd: 5 });
 * states.at(-1)?.gauges.crowd; // 5
 */
function watched() {
  const platform = createManualHost({ screens: [BUILTIN, EXTERNAL] });
  const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO, timeZone: 'UTC' });
  const recorder = screenRecorder();
  const states: SharedSnapshot[] = [];

  engine.mountScreens(recorder.theme, recorder.layers);
  engine.onState((state) => states.push(state));

  return { engine, platform, recorder, states };
}

describe('what every screen shares, as plain values', () => {
  test('holds the Gauges, today’s tally, the recent Events and when it was read', () => {
    const { engine } = watched();

    engine.setGauges({ crowd: 5 });
    engine.send(tramloEvent({ id: 'push', gauge: { role: 'daily', by: 3 } }));
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));

    const state = engine.state();

    expect(state.at).toBe(START);
    expect(state.gauges).toEqual({ crowd: 5, daily: 3, total: 0, build: 'error' });
    expect(state.today.roles).toEqual({ approval: 1, deploy: 1 });
    expect(state.today.lastDeploy?.id).toBe('d1');
    expect(state.recent.map((event) => event.id)).toEqual(['d1', 'push']);
  });

  test('is told once per change, and never for a replay or a value that stays the same', () => {
    const { engine, states } = watched();

    engine.setGauges({ crowd: 5 });
    engine.setGauges({ crowd: 5 });
    engine.send(tramloEvent({ id: 'push', gauge: { role: 'daily', by: 3 } }));
    engine.send(tramloEvent({ id: 'push', gauge: { role: 'daily', by: 3 } }));

    expect(states.map((state) => [state.gauges.crowd, state.gauges.daily, state.recent.length])).toEqual([
      [5, 0, 0],
      [5, 3, 1],
    ]);
  });

  test('is told before the Event that changed it plays', () => {
    const { engine, recorder } = watched();
    const order: string[] = [];

    engine.onState((state) => order.push(`state ${state.today.roles.approval ?? 0}`));
    for (const id of ['builtin', 'external']) recorder.on(id).host.onEvent((event) => order.push(`play ${event.id}`));

    engine.send(tramloEvent({ id: 'pr-1' }));

    expect(order).toEqual(['state 1', 'play pr-1']);
  });

  test('is told of the new day when midnight is noticed', () => {
    const { engine, platform, states } = watched();
    engine.send(tramloEvent({ id: 'push', gauge: { role: 'daily', by: 3 } }));

    platform.advance(10 * HOUR);
    engine.setGauges({ crowd: 2 });

    expect(states.at(-1)).toMatchObject({ gauges: { crowd: 2, daily: 0 }, today: { roles: {} } });
    expect(states.at(-1)?.recent).toHaveLength(1);
  });

  test('stops telling once cancelled', () => {
    const { engine } = watched();
    const heard: SharedSnapshot[] = [];
    const cancel = engine.onState((state) => heard.push(state));

    cancel();
    engine.setGauges({ crowd: 5 });

    expect(heard).toEqual([]);
  });
});
