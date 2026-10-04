import type { Rect } from '@deskorama/core';
import { xmlText } from './xml-text.ts';

/**
 * Returns the barrel-roof hangar under the board's pylons, with its sliding door and painted name.
 * @example
 * hangarMarkup(layoutFor(host.screen).hangar, 'HANGAR 2');
 */
export function hangarMarkup(rect: Rect, label: string): string {
  const { x, y, w, h } = rect;
  const eave = y + 40;

  let seams = '';
  for (let px = x + 46; px < x + w - 40; px += 37) {
    seams += `<rect class="hangar-seam" x="${px}" y="${eave + 18}" width="2" height="${h - 58}"/>`;
  }

  return `<path class="t-facade" d="M${x},${eave} Q${x + w / 2},${y - 40} ${x + w},${eave} V${y + h} H${x} Z"/>
    <path class="roof-ribs" d="M${x + 60},${eave - 14} Q${x + w / 2},${y - 22} ${x + w - 60},${eave - 14}"/>
    <rect class="hangar-door" x="${x + 34}" y="${eave + 16}" width="${w - 68}" height="${h - 56}"/>
    ${seams}
    <text class="hangar-text" x="${x + w / 2}" y="${eave + 8}" text-anchor="middle">${xmlText(label)}</text>`;
}
