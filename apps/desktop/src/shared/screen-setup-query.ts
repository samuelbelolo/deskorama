import type { ScreenSetup } from './screen-setup.ts';

/**
 * Returns the query string parameters that carry a screen setup to a wallpaper page, the screens and the scene as
 * JSON.
 * @example
 * screenSetupQuery({ screen: builtin, screens: [builtin], scene, seed: 7 });
 * // { screen: '1', x: '0', y: '0', width: '1728', height: '1117', seed: '7', screens: '[{"id":"1",…}]',
 * //   scene: '{"theme":"aeroport",…}' }, and bottomInset: '75' for a screen with a Dock along its bottom edge
 */
export function screenSetupQuery(setup: ScreenSetup): Record<string, string> {
  const { id, x, y, width, height, bottomInset } = setup.screen;

  return {
    screen: id,
    x: String(x),
    y: String(y),
    width: String(width),
    height: String(height),
    ...(bottomInset === undefined ? {} : { bottomInset: String(bottomInset) }),
    seed: String(setup.seed),
    screens: JSON.stringify(setup.screens),
    scene: JSON.stringify(setup.scene),
  };
}
