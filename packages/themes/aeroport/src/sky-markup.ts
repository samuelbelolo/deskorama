import type { Random } from '@deskorama/core';
import type { Layout } from './layout.ts';

/** A flat poster cloud, 140 x 44 units. */
const CLOUD_PATH =
  'M0,44 C0,30 12,22 26,24 C30,8 50,0 66,6 C78,-4 104,0 110,18 C124,14 140,24 140,38 C140,42 138,44 136,44 Z';

/** How many clouds and stars the sky holds. */
const CLOUD_COUNT = 4;
const STAR_COUNT = 56;

/**
 * Returns the sky: a flat ground colour, three tint rings around the sun or the moon (placed later by the hour),
 * stars that show at night, and flat clouds. No gradient, as on a printed poster.
 * @example
 * skyMarkup(layoutFor(host.screen), createRandom(11)).includes('sky-ring'); // true
 */
export function skyMarkup(layout: Layout, random: Random): string {
  const { width: w, horizon } = layout;

  const stars = Array.from({ length: STAR_COUNT }, () => {
    const x = Math.round(random.next() * w);
    const y = Math.round(30 + random.next() * (horizon - 130));
    const r = (0.8 + random.next() * 1.3).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  }).join('');

  const clouds = Array.from({ length: CLOUD_COUNT }, () => `<path class="cloud" d="${CLOUD_PATH}"/>`).join('');

  return `<rect class="t-sky1" width="${w}" height="${horizon}"/>
    <circle class="sky-ring t-sky2" r="900"/>
    <circle class="sky-ring t-sky3" r="560"/>
    <circle class="sky-ring t-sky4" r="300"/>
    <g class="stars">${stars}</g>
    <g class="sun"><circle r="62" class="sun-halo"/><circle r="48" class="sun-disc"/></g>
    <g class="moon"><circle r="30" class="moon-disc"/><circle r="27" cx="12" cy="-7" class="moon-bite"/></g>
    <g class="clouds">${clouds}</g>`;
}
