import type { ConnectorLogo } from '@deskorama/core';
import { element } from './element.ts';
import { svgGlyph } from './svg-glyph.ts';

/**
 * Returns a service's logo on its rounded tile, `size` points wide, like an app icon: the mark and the tile's
 * colour come from the Connector, so a dark mark still reads on a dark window.
 * @example
 * logoTile(github.about.logo, 34); // a near-black tile with the white GitHub mark
 */
export function logoTile(logo: ConnectorLogo, size: number): HTMLElement {
  return element(
    'span',
    {
      className: 'logo-tile',
      style: { '--size': `${size}px`, 'background-color': logo.tileColour, color: logo.markColour },
    },
    [svgGlyph(logo.size, logo.path, 'logo-mark')],
  );
}
