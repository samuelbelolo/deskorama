import { controllerMarkup } from './controller-markup.ts';
import type { Layout } from './layout.ts';
import { xmlText } from './xml-text.ts';

/**
 * Returns the control tower in the right strip: the beacon on its mast with the beam that turns while a deploy
 * runs, the shaft with its slits, and the cab whose controller changes pose with the build state and the hour.
 * @example
 * towerMarkup(layoutFor(host.screen), 'Contrôle').includes('pose-sleep'); // true
 */
export function towerMarkup(layout: Layout, word: string): string {
  const { x, w, cabTop, cabBottom } = layout.tower;
  const base = layout.horizon;
  const shaftX = x + 42;
  const shaftW = 46;
  const beacon = { x: x + 66, y: cabTop - 62 };

  let slits = '';
  for (let y = cabBottom + 38; y < base - 20; y += 34) {
    slits += `<rect class="tower-slit" x="${shaftX + shaftW / 2 - 3}" y="${y}" width="6" height="16"/>`;
  }

  return `<path class="beam" data-part="beam" transform="translate(${beacon.x} ${beacon.y})"
      d="M0,0 L130,-14 L130,14 Z M0,0 L-130,-14 L-130,14 Z"/>
    <rect class="mast" x="${beacon.x - 1.5}" y="${beacon.y}" width="3" height="${cabTop - beacon.y - 8}"/>
    <circle class="beacon" cx="${beacon.x}" cy="${beacon.y}" r="5"/>
    <path class="t-facade" d="M${shaftX - 6},${base} L${shaftX + 2},${cabBottom + 18} H${shaftX + shaftW - 2} L${shaftX + shaftW + 6},${base} Z"/>
    <rect class="tower-stripe" x="${shaftX + 4}" y="${cabBottom + 18}" width="5" height="${base - cabBottom - 18}"/>
    ${slits}
    <rect class="t-plinth" x="${x + 12}" y="${cabBottom}" width="${w - 24}" height="20"/>
    <text class="tower-text" x="${x + w / 2}" y="${cabBottom + 14}" text-anchor="middle">${xmlText(word)}</text>
    <path class="t-glass" d="M${x},${cabTop} H${x + w} L${x + w - 12},${cabBottom - 10} H${x + 12} Z"/>
    <g class="cab-inside">${controllerMarkup(x + w / 2, cabBottom - 10)}</g>
    <path class="cab-frame" d="M${x},${cabTop} H${x + w} L${x + w - 12},${cabBottom - 10} H${x + 12} Z M${x + 33},${cabTop} L${x + 36},${cabBottom - 10} M${x + w / 2},${cabTop} V${cabBottom - 10} M${x + w - 33},${cabTop} L${x + w - 36},${cabBottom - 10}"/>
    <rect class="cab-sill" x="${x + 10}" y="${cabBottom - 10}" width="${w - 20}" height="10"/>
    <rect class="t-facade" x="${x - 6}" y="${cabTop - 10}" width="${w + 12}" height="10"/>`;
}
