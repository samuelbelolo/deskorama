import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import { createManualHost } from './manual-host.ts';
import { recordingTheme } from './recording-theme.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

describe('the engine', () => {
  test('mounts the Theme on the first screen with the display language and the host settings', () => {
    const { theme, recording } = recordingTheme();
    createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO }).mount(theme, 'scene layer');
    expect(recording.layer).toBe('scene layer');
    expect(recording.host).toMatchObject({ lang: 'en', reducedMotion: false, screen: { id: 'builtin', width: 1440 } });
  });

  test('forwards each Event to the mounted Theme in the display language', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'fr', seed: 7, source: TRAMLO });
    engine.mount(theme, 'layer');
    engine.send(tramloEvent());
    expect(recording.events).toHaveLength(1);
    expect(recording.events[0]).toMatchObject({
      archetype: 'approval',
      label: 'Pull request mergée',
      meta: { detail: '#418 Corrige la connexion Google', tag: 'MERGÉE' },
    });
  });

  test('stops forwarding once the Theme is unmounted, even if it kept its subscription', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO });
    const unmount = engine.mount(theme, 'layer');
    unmount();
    engine.send(tramloEvent());
    expect(recording.unmounted).toBe(true);
    expect(recording.events).toEqual([]);
  });

  test('hands the same seed the same random sequence', () => {
    const first = recordingTheme();
    const second = recordingTheme();
    createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO }).mount(first.theme, 'layer');
    createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO }).mount(second.theme, 'layer');
    expect(first.recording.host?.random.next()).toBe(second.recording.host?.random.next());
  });

  test('refuses to mount when the host reports no screen', () => {
    const { theme } = recordingTheme();
    const engine = createEngine(createManualHost({ screens: [] }), { lang: 'en', seed: 7, source: TRAMLO });
    expect(() => engine.mount(theme, 'layer')).toThrow('no screen');
  });
});

describe('deduplication', () => {
  test('plays an Event once, even when its Source returns it again', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO });
    engine.mount(theme, 'layer');
    engine.send(tramloEvent());
    engine.send(tramloEvent());
    expect(recording.events).toHaveLength(1);
    expect(recording.host?.today().kinds['pull_request.merged']).toBe(1);
  });

  test('tells two Sources apart when they use the same id', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO });
    engine.mount(theme, 'layer');
    engine.send(tramloEvent({ id: '1' }));
    engine.send(tramloEvent({ id: '1', source: 'Mail', archetype: null }));
    expect(recording.events.map((event) => event.source)).toEqual(['Tramlo', 'Mail']);
  });

  test('never moves a Gauge twice for a replayed Event', () => {
    const { theme, recording } = recordingTheme();
    const engine = createEngine(createManualHost(), { lang: 'en', seed: 7, source: TRAMLO });
    engine.mount(theme, 'layer');
    const pushed = tramloEvent({ id: 'push-1', kind: 'push.main', gauge: { role: 'daily', by: 3 } });
    engine.send(pushed);
    engine.send(pushed);
    expect(recording.host?.gauges().daily).toBe(3);
  });
});
