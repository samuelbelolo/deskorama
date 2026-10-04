import { describe, expect, test } from 'vitest';
import { readScreenSetup } from '../src/shared/read-screen-setup.ts';
import { screenSetupQuery } from '../src/shared/screen-setup-query.ts';
import { screenOfDisplay } from '../src/main/screen-of-display.ts';

describe('the screen setup a wallpaper page opens with', () => {
  test('carries an external display, its place in the arrangement, the language and the seed', () => {
    const screen = screenOfDisplay({ id: 69_734_208, bounds: { x: 1728, y: -200, width: 2560, height: 1440 } });
    const setup = { screen, lang: 'fr' as const, seed: 1_234_567 };
    const search = `?${new URLSearchParams(screenSetupQuery(setup)).toString()}`;
    expect(readScreenSetup(search)).toEqual(setup);
    expect(setup.screen).toEqual({ id: '69734208', x: 1728, y: -200, width: 2560, height: 1440 });
  });

  test('refuses a page opened without its screen', () => {
    expect(() => readScreenSetup('?lang=en&seed=1')).toThrow(/"screen"/);
    expect(() => readScreenSetup('?screen=1&x=0&y=0&width=wide&height=900&seed=1')).toThrow(/"width"/);
  });
});
