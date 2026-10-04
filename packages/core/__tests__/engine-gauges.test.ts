import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import type { GaugeValues } from '../src/gauge-values.ts';
import type { ScreenHost } from '../src/screen-host.ts';
import { createManualHost } from './manual-host.ts';
import { mountedHost, recordingTheme } from './recording-theme.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

/**
 * Returns an engine with a recording Theme mounted, and the host that Theme received.
 * @example
 * const { engine, host } = mounted('en');
 * engine.setGauges({ daily: 4 });
 * host.gauges().daily; // 4
 */
function mounted(lang: 'fr' | 'en' = 'en'): { engine: ReturnType<typeof createEngine>; host: ScreenHost } {
  const { theme, recording } = recordingTheme();
  const engine = createEngine(createManualHost(), { lang, seed: 7, source: TRAMLO, timeZone: 'UTC' });
  engine.mount(theme, 'layer');
  return { engine, host: mountedHost(recording) };
}

describe('the Gauges', () => {
  test('start at zero with the build idle', () => {
    expect(mounted().host.gauges()).toEqual({ crowd: 0, daily: 0, total: 0, build: 'idle' });
  });

  test('carry the Source’s own labels in the display language, with the crowd’s max', () => {
    expect(mounted('fr').host.source).toEqual({
      name: 'Tramlo',
      gauges: {
        crowd: { label: 'Contributeurs actifs sur la dernière heure', short: 'ACTIFS', max: 14 },
        daily: { label: 'Commits aujourd’hui', short: 'COMMITS' },
        total: { label: 'Issues ouvertes', short: 'ISSUES' },
      },
    });
    expect(mounted('en').host.source.gauges.crowd.short).toBe('ACTIVE');
  });

  test('take the values a Source reports, keeping the roles it leaves out', () => {
    const { engine, host } = mounted();
    engine.setGauges({ crowd: 4, daily: 23, total: 37 });
    engine.setGauges({ crowd: 6 });
    expect(host.gauges()).toEqual({ crowd: 6, daily: 23, total: 37, build: 'idle' });
  });

  test('move when an Event implies it, never below zero', () => {
    const { engine, host } = mounted();
    engine.setGauges({ crowd: 2, daily: 23, total: 37 });
    engine.send(tramloEvent({ id: 'push-1', kind: 'push.main', gauge: { role: 'daily', by: 3 } }));
    engine.send(tramloEvent({ id: 'issue-9', kind: 'issue.opened', gauge: { role: 'total', by: 1 } }));
    engine.send(tramloEvent({ id: 'left-1', kind: 'session.ended', gauge: { role: 'crowd', by: -5 } }));
    expect(host.gauges()).toMatchObject({ crowd: 0, daily: 26, total: 38 });
  });

  test('follow the deploy steps for the build state, which stays until the next step', () => {
    const { engine, host } = mounted();
    const deploy = (id: string, step: 'started' | 'succeeded' | 'failed'): void =>
      engine.send(tramloEvent({ id, kind: `deploy.${step}`, archetype: 'deploy', step }));
    deploy('d1', 'started');
    expect(host.gauges().build).toBe('building');
    deploy('d2', 'succeeded');
    expect(host.gauges().build).toBe('ready');
    deploy('d3', 'started');
    deploy('d4', 'failed');
    expect(host.gauges().build).toBe('error');
  });

  test('tell their listeners about real changes only, until they cancel', () => {
    const { engine, host } = mounted();
    const heard: GaugeValues[] = [];
    const cancel = host.onGauges((values) => heard.push(values));
    engine.setGauges({ daily: 5 });
    engine.setGauges({ daily: 5 });
    cancel();
    engine.setGauges({ daily: 6 });
    expect(heard).toEqual([{ crowd: 0, daily: 5, total: 0, build: 'idle' }]);
  });

  test('are shared: a Theme mounted later reads the values already reached', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO });
    engine.setGauges({ total: 37 });
    engine.send(tramloEvent({ id: 'issue-9', gauge: { role: 'total', by: 1 } }));
    engine.mount(theme, 'layer');
    expect(mountedHost(recording).gauges().total).toBe(38);
  });
});
