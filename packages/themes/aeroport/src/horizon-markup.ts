import type { Layout } from './layout.ts';

/**
 * Returns the far hills, a few poplars and the little village with its steeple, on the line of the horizon.
 * @example
 * horizonMarkup(layoutFor(host.screen)).includes('steeple'); // true
 */
export function horizonMarkup(layout: Layout): string {
  const { width: w, farLine: h } = layout;
  const k = w / 1440;
  const village = Math.round(818 * k);

  const poplars = [w - 144, w - 122, w - 22, w - 8, village - 6, village + 34]
    .map(
      (x, i) => `<ellipse class="t-far-dark" cx="${x}" cy="${h + 6 - (i % 2) * 6}" rx="7" ry="${26 + (i % 3) * 5}"/>`,
    )
    .join('');

  const hills =
    `M0,${h + 12} C${140 * k},${h - 16} ${260 * k},${h} ${400 * k},${h - 4} ` +
    `C${560 * k},${h - 10} ${640 * k},${h - 34} ${800 * k},${h - 20} ` +
    `C${930 * k},${h - 8} ${1020 * k},${h - 28} ${1160 * k},${h - 16} ` +
    `C${1270 * k},${h - 6} ${1360 * k},${h - 22} ${w},${h - 14} V${layout.horizon} H0 Z`;

  return `<path class="t-far" d="${hills}"/>
    ${poplars}
    <rect class="t-far-dark" x="${village}" y="${h + 6}" width="16" height="20"/>
    <path class="t-far-dark" d="M${village - 3},${h + 7} L${village + 8},${h - 3} L${village + 19},${h + 7} Z"/>
    <rect class="t-far-dark steeple" x="${village + 12}" y="${h - 12}" width="8" height="38"/>
    <path class="t-far-dark" d="M${village + 11},${h - 11} L${village + 16},${h - 34} L${village + 21},${h - 11} Z"/>`;
}
