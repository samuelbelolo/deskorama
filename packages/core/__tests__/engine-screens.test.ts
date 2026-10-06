import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import type { Screen } from '../src/screen.ts';
import { BUILTIN, createManualHost, EXTERNAL } from './manual-host.ts';
import { recordingTheme } from './recording-theme.ts';
import { screenRecorder } from './screen-recorder.ts';
import { TRAMLO } from './tramlo.ts';

/**
 * Mounts a recording Theme on every screen of a manual host that starts with `screens`.
 * @example
 * const { platform, recorder } = mountedOn([BUILTIN]);
 * platform.setScreens([BUILTIN, EXTERNAL]);
 * recorder.log; // ["open builtin", "open external"]
 */
function mountedOn(screens: readonly Screen[]) {
  const platform = createManualHost({ screens });
  const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO });
  const recorder = screenRecorder();
  const unmount = engine.mountScreens(recorder.theme, recorder.layers);

  return { platform, recorder, unmount };
}

describe('screens changing while the wallpaper runs', () => {
  test('mount an instance on a screen plugged in, and unmount the one of a screen unplugged', () => {
    const { platform, recorder } = mountedOn([BUILTIN]);

    platform.setScreens([BUILTIN, EXTERNAL]);
    const external = recorder.on('external');
    platform.setScreens([BUILTIN]);

    expect(external.unmounted).toBe(true);
    expect(recorder.on('builtin').unmounted).toBe(false);
    expect(recorder.log).toEqual(['open builtin', 'open external', 'close external']);
  });

  test('mount a fresh instance at the new size when a screen is resized or moved', () => {
    const { platform, recorder } = mountedOn([BUILTIN, EXTERNAL]);
    const before = recorder.on('external');

    platform.setScreens([BUILTIN, { ...EXTERNAL, width: 1920, height: 1080 }]);
    platform.setScreens([BUILTIN, { ...EXTERNAL, x: -1920, width: 1920, height: 1080 }]);

    expect(before.unmounted).toBe(true);
    expect(recorder.on('external').layer).toBe('layer of external at 1920x1080');
    expect(recorder.on('external').host.screen.x).toBe(-1920);
    expect(recorder.instances.filter((each) => each.host.screen.id === 'builtin')).toHaveLength(1);
  });

  test('lay the scene out again on the same layer when the Dock moves the line its ground ends on', () => {
    const { platform, recorder } = mountedOn([BUILTIN]);
    const before = recorder.on('builtin');

    platform.setScreens([{ ...BUILTIN, bottomInset: 75 }]);
    const above = recorder.on('builtin');
    // A Dock that grows within one tile row leaves the ground where it is: nothing is mounted again.
    platform.setScreens([{ ...BUILTIN, bottomInset: 80 }]);

    expect(before.unmounted).toBe(true);
    expect(above.unmounted).toBe(false);
    expect(above.host.screen.bottomInset).toBe(75);
    expect(above.layer).toBe(before.layer);

    platform.setScreens([BUILTIN]);

    expect(above.unmounted).toBe(true);
    expect(recorder.on('builtin').host.screen).toEqual(BUILTIN);
    expect(recorder.log).toEqual(['open builtin']);
  });

  test('tell every instance the new arrangement, so a Theme can hand an animation to its neighbour', () => {
    const { platform, recorder } = mountedOn([BUILTIN]);
    const heard: string[][] = [];
    recorder.on('builtin').host.onScreens((screens) => heard.push(screens.map((screen) => screen.id)));

    platform.setScreens([BUILTIN, EXTERNAL]);

    expect(heard).toEqual([['builtin', 'external']]);
    expect(recorder.on('builtin').host.screens()).toEqual([BUILTIN, EXTERNAL]);
  });

  test('wait for a screen when none is connected', () => {
    const { platform, recorder } = mountedOn([]);
    expect(recorder.instances).toEqual([]);

    platform.setScreens([BUILTIN]);

    expect(recorder.on('builtin').host.screen).toEqual(BUILTIN);
  });

  test('stop following screens and windows once every instance is unmounted', () => {
    const { platform, recorder, unmount } = mountedOn([BUILTIN, EXTERNAL]);

    unmount();

    expect(recorder.instances.every((each) => each.unmounted)).toBe(true);
    expect(recorder.log.slice(2)).toEqual(['close builtin', 'close external']);
    expect(platform.frameFollowers()).toBe(0);
    expect(platform.screenFollowers()).toBe(0);
  });

  test('leave a Theme mounted on one screen alone when the other screens change', () => {
    const platform = createManualHost({ screens: [BUILTIN] });
    const { theme, recording } = recordingTheme();
    createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO }).mount(theme, 'layer');

    platform.setScreens([{ ...BUILTIN, width: 1280 }, EXTERNAL]);

    expect(recording.unmounted).toBe(false);
    expect(recording.host?.screen).toEqual(BUILTIN);
    expect(recording.host?.screens()).toHaveLength(2);
  });

  test('leave no view or layer behind when a Theme throws while mounting', () => {
    const platform = createManualHost({ screens: [BUILTIN] });
    const engine = createEngine(platform, { lang: 'en', seed: 7, source: TRAMLO });
    const recorder = screenRecorder();
    const broken = {
      name: 'broken',
      mount: () => {
        throw new Error('no scene');
      },
    };

    expect(() => engine.mountScreens(broken, recorder.layers)).toThrow('no scene');

    expect(recorder.log).toEqual(['open builtin', 'close builtin']);
    expect(platform.frameFollowers()).toBe(0);
    expect(platform.screenFollowers()).toBe(0);
  });
});
