import type { ScreenSetup } from './screen-setup.ts';

/**
 * Returns the query string parameters that carry a screen setup to a renderer page.
 * @example
 * screenSetupQuery({ screen: { id: '1', x: 0, y: 0, width: 1728, height: 1117 }, lang: 'fr', seed: 7 });
 * // { screen: '1', x: '0', y: '0', width: '1728', height: '1117', lang: 'fr', seed: '7' }
 */
export function screenSetupQuery(setup: ScreenSetup): Record<string, string> {
  const { id, x, y, width, height } = setup.screen;
  return {
    screen: id,
    x: String(x),
    y: String(y),
    width: String(width),
    height: String(height),
    lang: setup.lang,
    seed: String(setup.seed),
  };
}
