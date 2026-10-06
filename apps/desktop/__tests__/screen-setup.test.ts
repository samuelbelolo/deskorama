import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import { describe, expect, test } from 'vitest';
import { readScreenSetup } from '../src/shared/read-screen-setup.ts';
import { screenSetupQuery } from '../src/shared/screen-setup-query.ts';
import { screenOfDisplay } from '../src/main/screen-of-display.ts';

describe('the screen setup a wallpaper page opens with', () => {
  test('carries an external display, its place among its neighbours, the scene and the seed', () => {
    const builtin = screenOfDisplay({
      id: 1,
      bounds: { x: 0, y: 0, width: 1728, height: 1117 },
      workArea: { x: 0, y: 33, width: 1728, height: 1009 },
    });
    const screen = screenOfDisplay({
      id: 69_734_208,
      bounds: { x: 1728, y: -200, width: 2560, height: 1440 },
      workArea: { x: 1728, y: -175, width: 2560, height: 1415 },
    });
    const scene = { theme: 'aeroport', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE } as const;
    const setup = { screen, screens: [builtin, screen], scene, seed: 1_234_567 };
    const search = `?${new URLSearchParams(screenSetupQuery(setup)).toString()}`;
    expect(readScreenSetup(search)).toEqual(setup);
    expect(setup.screen).toEqual({ id: '69734208', x: 1728, y: -200, width: 2560, height: 1440 });
  });

  test('carries the room the Dock takes along the bottom of the page’s own screen', () => {
    const screen = screenOfDisplay({
      id: 1,
      bounds: { x: 0, y: 0, width: 1728, height: 1117 },
      workArea: { x: 0, y: 33, width: 1728, height: 1009 },
    });
    const scene = { theme: 'aeroport', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE } as const;
    const setup = { screen, screens: [screen], scene, seed: 7 };
    const search = `?${new URLSearchParams(screenSetupQuery(setup)).toString()}`;

    expect(screen.bottomInset).toBe(75);
    expect(readScreenSetup(search)).toEqual(setup);
  });

  test('refuses a page opened without its screen', () => {
    expect(() => readScreenSetup('?seed=1')).toThrow(/"screen"/);
    expect(() => readScreenSetup('?screen=1&x=0&y=0&width=wide&height=900&seed=1')).toThrow(/"width"/);
  });

  test('refuses a page opened without its neighbours', () => {
    const page = '?screen=1&x=0&y=0&width=1440&height=900&seed=1';
    const halfScreen = [{ id: '1', x: 0, y: 0, width: 1440 }];

    expect(() => readScreenSetup(page)).toThrow(/"screens"/);
    expect(() => readScreenSetup(`${page}&screens=${encodeURIComponent(JSON.stringify(halfScreen))}`)).toThrow(
      /"screens"/,
    );
  });

  test('refuses a page opened without a scene it can draw', () => {
    const page = '?screen=1&x=0&y=0&width=1440&height=900&seed=1&screens=[]';
    const scene = { theme: 'tabloid', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE };

    expect(() => readScreenSetup(page)).toThrow(/"scene"/);
    expect(() => readScreenSetup(`${page}&scene=${encodeURIComponent(JSON.stringify(scene))}`)).toThrow(/"scene"/);
  });
});
