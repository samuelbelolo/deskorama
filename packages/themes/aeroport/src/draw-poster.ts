import { createRandom } from '@deskorama/core';
import { groundMarkup } from './ground-markup.ts';
import { hangarMarkup } from './hangar-markup.ts';
import { horizonMarkup } from './horizon-markup.ts';
import type { Layout } from './layout.ts';
import { skyMarkup } from './sky-markup.ts';
import { stationMarkup } from './station-markup.ts';
import type { Strings } from './strings.ts';
import { svgMarkup } from './svg-markup.ts';
import { terminalMarkup } from './terminal-markup.ts';
import { towerMarkup } from './tower-markup.ts';

/** The seed of the stars, so the night sky is the same on every screen and every run. */
const STAR_SEED = 11;

/**
 * Returns the poster behind every Gag: the sky, the far hills, the buildings of this side of the airport, and the
 * ground from the apron to the grass. The terminal side has the hangar, the terminal with its lounge and the tower;
 * the airfield side the cargo hangar and the fire station. Its colours come from the tints the hour writes on the
 * root.
 * @example
 * root.append(drawPoster(layoutFor(host.screen), textFor('fr')));
 */
export function drawPoster(layout: Layout, text: Strings): SVGSVGElement {
  const { width: w, height: h } = layout;

  const poster = svgMarkup(`<svg class="aeroport-poster" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${skyMarkup(layout, createRandom(STAR_SEED))}
    ${horizonMarkup(layout)}
    ${buildingsMarkup(layout, text)}
    ${groundMarkup(layout)}
  </svg>`);

  poster.setAttribute('role', 'img');
  poster.setAttribute('aria-label', text.description);

  return poster;
}

/**
 * Returns the buildings of one side of the airport, back to front.
 * @example
 * buildingsMarkup(layoutFor(external), textFor('en')).includes('AIRPORT FIRE SERVICE'); // true
 */
function buildingsMarkup(layout: Layout, text: Strings): string {
  const { paint } = text;

  if (layout.side === 'airfield') {
    return `${hangarMarkup(layout.hangar, paint.cargoHangar)}
      ${stationMarkup(layout.station, paint.station)}`;
  }

  return `${hangarMarkup(layout.hangar, paint.hangar)}
    ${terminalMarkup(layout.terminal, text)}
    ${towerMarkup(layout, paint.tower)}`;
}
