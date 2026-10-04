import type { Rect, ScreenHost } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { fitShout, type Shout } from './fit-shout.ts';
import { textWidth } from './text-width.ts';

/** A shout of the collapse and when it is heard, in ms after the failure. */
export interface TimedShout extends Shout {
  readonly from: number;
  readonly to: number;
}

/**
 * Returns the shouts of the collapse fitted where they show: the crack over the site sign as the site gives way,
 * then, on the roof, the worker left hanging from the hook calling for help beside them.
 * @example
 * jackpotShouts(host, copy, { sign, hanging }).map((shout) => shout.text); // ["CRAC !", "AU SECOURS !"]
 */
export function jackpotShouts(
  host: ScreenHost,
  copy: Copy,
  site: { readonly sign: Rect; readonly hanging: Rect | null },
): TimedShout[] {
  const words = copy.text.collapse;
  const shouts: TimedShout[] = [];

  const crack = fitShout(host, copy.fill(words.crack), { x: site.sign.x + 10, y: site.sign.y - 14 }, 2);
  if (crack !== null) shouts.push({ ...crack, from: 0, to: 900 });

  if (site.hanging === null) return shouts;

  const text = copy.fill(words.help);
  const half = Math.ceil(textWidth(text) / 2);
  const { x, y, w } = site.hanging;
  const help =
    fitShout(host, text, { x: x - half - 3, y: y + 2 }, 1) ??
    fitShout(host, text, { x: x + w + half + 3, y: y + 2 }, 1);
  if (help !== null) shouts.push({ ...help, from: 700, to: 3400 });

  return shouts;
}
