import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import type { ScreenHost } from '../src/screen-host.ts';
import { createManualHost, START, type ManualHost } from './manual-host.ts';
import { mountedHost, recordingTheme } from './recording-theme.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

const HOUR = 3_600_000;

/**
 * Returns an engine counting days in UTC, the manual host it runs on, and the host its Theme received.
 * @example
 * const { engine, platform, host } = mounted();
 * platform.advance(10 * HOUR); // past midnight UTC
 */
function mounted(): { engine: ReturnType<typeof createEngine>; platform: ManualHost; host: ScreenHost } {
  const { theme, recording } = recordingTheme();
  const platform = createManualHost();
  const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO, timeZone: 'UTC' });
  engine.mount(theme, 'layer');
  return { engine, platform, host: mountedHost(recording) };
}

describe('today', () => {
  test('counts Events per kind and per Role; an Event with no Role counts by kind only', () => {
    const { engine, host } = mounted();
    engine.send(tramloEvent({ id: 'a' }));
    engine.send(tramloEvent({ id: 'b' }));
    engine.send(tramloEvent({ id: 'c', kind: 'review.approved', archetype: 'like' }));
    engine.send(tramloEvent({ id: 'd', kind: 'mail.received', archetype: null, source: 'Mail' }));
    expect(host.today().kinds).toEqual({ 'pull_request.merged': 2, 'review.approved': 1, 'mail.received': 1 });
    expect(host.today().roles).toEqual({ approval: 2, like: 1 });
  });

  test('keeps the latest finished deploy, not a deploy that only started', () => {
    const { engine, host } = mounted();
    expect(host.today().lastDeploy).toBeNull();
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.succeeded', archetype: 'deploy', step: 'succeeded' }));
    engine.send(tramloEvent({ id: 'd2', kind: 'deploy.started', archetype: 'deploy', step: 'started' }));
    expect(host.today().lastDeploy).toMatchObject({ id: 'd1', meta: { step: 'succeeded' } });
  });

  test('starts again from zero after midnight, with the daily Gauge, and keeps the last deploy', () => {
    const { engine, platform, host } = mounted();
    engine.setGauges({ daily: 23, total: 37 });
    engine.send(tramloEvent({ id: 'd1', kind: 'deploy.failed', archetype: 'deploy', step: 'failed' }));
    platform.advance(9 * HOUR);
    expect(host.today().kinds).toEqual({ 'deploy.failed': 1 });
    platform.advance(1 * HOUR);
    expect(host.today()).toEqual({ kinds: {}, roles: {}, lastDeploy: expect.objectContaining({ id: 'd1' }) });
    expect(host.gauges()).toMatchObject({ daily: 0, total: 37 });
  });

  test('keeps a late Event from yesterday among the recent ones without counting it today', () => {
    const { engine, platform, host } = mounted();
    platform.advance(12 * HOUR);
    engine.send(tramloEvent({ id: 'late', gauge: { role: 'daily', by: 3 }, at: new Date(START) }));
    engine.send(tramloEvent({ id: 'issue', gauge: { role: 'total', by: 1 }, at: new Date(START) }));
    expect(host.today().kinds).toEqual({});
    expect(host.gauges()).toMatchObject({ daily: 0, total: 1 });
    expect(host.recent().map((event) => event.id)).toEqual(['issue', 'late']);
  });

  test('keeps the recent Events newest first, 12 by default and 40 at most', () => {
    const { engine, host } = mounted();
    for (let index = 0; index < 45; index += 1) engine.send(tramloEvent({ id: `e${index}` }));
    expect(host.recent()).toHaveLength(12);
    expect(host.recent(3).map((event) => event.id)).toEqual(['e44', 'e43', 'e42']);
    expect(host.recent(100)).toHaveLength(40);
    expect(host.recent()[0]?.label).toBe('Pull request merged');
  });
});
