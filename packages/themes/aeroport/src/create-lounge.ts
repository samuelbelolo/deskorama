import { createRandom } from '@deskorama/core';
import type { Layout } from './layout.ts';
import { personMarkup } from './person-markup.ts';
import { svgMarkup } from './svg-markup.ts';

/** How many silhouettes the glass hall holds. */
export const LOUNGE_PLACES = 40;

/** The seed of the silhouettes' places, so the hall looks the same on every run. */
const PLACES_SEED = 5;

/**
 * Fills the terminal's glass hall with silhouettes and returns how to show `count` of them: the crowd right now,
 * seen through the glass, with the back row smaller.
 * @example
 * const setLounge = createLounge(poster, layout);
 * setLounge(12);
 */
export function createLounge(poster: SVGElement, layout: Layout): (count: number) => void {
  const lounge = poster.querySelector('[data-part="lounge"]');
  if (lounge === null) return () => {};

  const { terminal } = layout;
  const floor = terminal.y + terminal.h - 31;
  const random = createRandom(PLACES_SEED);

  const nodes = Array.from({ length: LOUNGE_PLACES }, (_, i) => {
    const back = i % 3 === 2;
    const scale = back ? 0.8 : 1.05;
    const x = terminal.x + 150 + ((i * 97 + random.next() * 40) % Math.max(1, terminal.w - 190));
    const y = floor - 26 * scale - (back ? 6 : 0);
    const look = personMarkup({ coat: 'var(--ink)', skin: 'var(--ink)', hat: random.next() < 0.2 });
    const group = svgMarkup(
      `<svg><g class="silhouette" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})">${look}</g></svg>`,
    ).firstElementChild;
    if (group !== null) lounge.append(group);
    return group;
  });

  return (count) => {
    nodes.forEach((node, i) => node?.setAttribute('opacity', i < count ? '0.62' : '0'));
  };
}
