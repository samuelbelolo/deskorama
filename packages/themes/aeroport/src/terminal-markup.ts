import type { Rect } from '@deskorama/core';
import type { Strings } from './strings.ts';
import { xmlText } from './xml-text.ts';

/** The width of one pane of the glass hall. */
const PANE = 31;

/** Where the three doors open in the plinth, from the terminal's left edge. */
const DOORS = [22, 300, 470] as const;

/**
 * Returns the terminal: the airport's name in roof letters, the glass hall with its mullions and the empty group
 * where the lounge's passengers stand, the corner lamp lit at night, and the plinth with its painted doors.
 * @example
 * terminalMarkup(layoutFor(host.screen).terminal, textFor('fr')).includes('PROD-LES-BAINS'); // true
 */
export function terminalMarkup(rect: Rect, text: Strings): string {
  const { x, y, w, h } = rect;
  const glassTop = y + 24;
  const glassBottom = y + h - 30;
  const glassHeight = glassBottom - glassTop;

  let mullions = '';
  for (let mx = x + 8; mx <= x + w - 8; mx += PANE) {
    mullions += `<rect class="mullion" x="${mx - 1.2}" y="${glassTop}" width="2.4" height="${glassHeight}"/>`;
  }

  const doors = DOORS.filter((dx) => dx + 40 < w)
    .map((dx, i) => doorMarkup(x + dx, glassBottom, text.paint.doors[i] ?? ''))
    .join('');

  return `<text class="roof-small" x="${x + 22}" y="${y - 52}">${xmlText(text.airport.welcome)}</text>
    <text class="roof-name" x="${x + 20}" y="${y - 6}">${xmlText(text.airport.name.toUpperCase())}</text>
    <rect class="t-glass" x="${x + 8}" y="${glassTop}" width="${w - 16}" height="${glassHeight}"/>
    <path class="glass-glint" d="M${x + 70},${glassBottom} L${x + 130},${glassTop} H${x + 160} L${x + 100},${glassBottom} Z"/>
    <g class="lounge" data-part="lounge"></g>
    <rect class="night-lamp" x="${x + 8}" y="${glassTop}" width="${PANE * 4}" height="${glassHeight}"/>
    ${mullions}
    <rect class="mullion" x="${x + 8}" y="${glassTop + 58}" width="${w - 16}" height="2.4"/>
    <rect class="t-facade" x="${x - 12}" y="${y}" width="${w + 24}" height="20"/>
    <text class="facade-text" x="${x + w / 2}" y="${y + 14.5}" text-anchor="middle">${xmlText(text.paint.terminal)}</text>
    <rect class="slab-shadow" x="${x - 4}" y="${y + 20}" width="${w + 8}" height="4"/>
    <rect class="t-plinth" x="${x}" y="${glassBottom}" width="${w}" height="${h - (glassBottom - y)}"/>
    ${doors}`;
}

/**
 * Returns one door in the plinth with its small painted plate.
 * @example
 * doorMarkup(62, 620, 'SORTIE');
 */
function doorMarkup(x: number, top: number, label: string): string {
  return `<rect class="door" x="${x}" y="${top + 8}" width="30" height="22"/>
    <rect class="door-plate" x="${x - 6}" y="${top + 1}" width="${label.length * 5.6 + 8}" height="9"/>
    <text class="door-text" x="${x - 2}" y="${top + 8.4}">${xmlText(label)}</text>`;
}
