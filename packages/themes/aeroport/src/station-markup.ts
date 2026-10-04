import type { Rect } from '@deskorama/core';
import { xmlText } from './xml-text.ts';

/** One bay of the fire station, in pixels: bay 1 stands open on its truck, bay 2 is shut. */
const BAY_WIDTH = 112;

/**
 * Returns the airfield's fire station: a low hall under an orange band painted with its name, the hose tower on its
 * right, bay 1 open and dark where the fire truck waits, bay 2 shut, each numbered.
 * @example
 * stationMarkup(layoutFor(external).station, "POMPIERS DE L'AÉROPORT").includes('bay-dark'); // true
 */
export function stationMarkup(rect: Rect, name: string): string {
  const { x, y, w, h } = rect;
  const bayTop = y + 46;
  const bayHeight = h - 46;
  const shutX = x + 146;

  return `<rect class="t-facade" x="${x + w - 64}" y="${y - 70}" width="44" height="${h + 70}"/>
    <rect class="hose-window" x="${x + w - 52}" y="${y - 56}" width="20" height="26"/>
    <rect class="t-facade" x="${x}" y="${y}" width="${w}" height="${h}"/>
    <rect class="station-band" x="${x}" y="${y}" width="${w}" height="14"/>
    <text class="station-name" x="${x + 16}" y="${y + 36}">${xmlText(name)}</text>
    <rect class="bay-dark" data-part="bay-1" x="${x + 16}" y="${bayTop}" width="${BAY_WIDTH}" height="${bayHeight}"/>
    <rect class="bay-door" x="${shutX}" y="${bayTop}" width="${BAY_WIDTH}" height="${bayHeight}"/>
    <path class="bay-seams" d="M${shutX},${bayTop + 18} h${BAY_WIDTH} M${shutX},${bayTop + 36} h${BAY_WIDTH} M${shutX},${bayTop + 54} h${BAY_WIDTH}"/>
    <text class="bay-number" x="${x + 72}" y="${bayTop - 4}" text-anchor="middle">1</text>
    <text class="bay-number" x="${shutX + 56}" y="${bayTop - 4}" text-anchor="middle">2</text>`;
}
