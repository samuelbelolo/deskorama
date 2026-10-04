import type { Copy } from './create-copy.ts';
import { PAL } from './palette.ts';
import type { SignLine } from './sign-line.ts';
import type { SiteStatus } from './site-status.ts';
import { textWidth } from './text-width.ts';
import { SIGN_W } from './site-geometry.ts';

/**
 * Returns the site sign's lines from its top-left corner: the day count in big digits, "JOURS SANS / ACCIDENT" beside
 * it, and the status line under them that finishes the sentence ("DE MISE EN LIGNE", "EN LIGNE À 14:08").
 * @example
 * siteSignLines(copy, 30, { line: 'DE MISE EN LIGNE', alarm: false, blink: false }, 256, 12).length; // 4
 */
export function siteSignLines(copy: Copy, days: number, status: SiteStatus, x: number, y: number): SignLine[] {
  const number = String(days);
  const site = copy.text.site;

  return [
    {
      text: number,
      x: x + 2 + Math.floor((18 - textWidth(number, 2)) / 2),
      y: y + 3,
      scale: 2,
      colour: status.alarm ? PAL.paper : PAL.lamp,
    },
    { text: copy.plural(days, site.days), x: x + 23, y: y + 3, scale: 1, colour: PAL.ink },
    { text: site.what, x: x + 23, y: y + 9, scale: 1, colour: PAL.ink },
    {
      text: status.line,
      x: x + Math.floor((SIGN_W - textWidth(status.line)) / 2),
      y: y + 19,
      scale: 1,
      colour: status.alarm ? PAL.paper : PAL.lamp,
    },
  ];
}
