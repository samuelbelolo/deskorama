/** A heart drawn in one stroke, in a 180 x 120 box, starting and ending at its point. */
const HEART =
  'M90,112 C60,88 14,66 14,36 C14,16 30,6 46,6 C64,6 80,18 90,34 C100,18 116,6 134,6 C150,6 166,16 166,36 C166,66 120,88 90,112 Z';

/** The heart's drawing box, in units. */
export const HEART_BOX = { w: 180, h: 120 } as const;

/**
 * Returns a heart drawn as a gold stroke, `w` x `h` pixels: upright in the sky, or squashed flat as if painted on
 * the tarmac. Its stroke is dashed by the Gag so the heart draws itself in the jet's wake, and an empty `tag` slot
 * in its middle takes the Event's tag as plain text.
 * @example
 * heartMarkup(300, 64, 'tarmac-heart').includes('data-slot="heart"'); // true
 */
export function heartMarkup(w: number, h: number, className: 'gold-trail' | 'tarmac-heart'): string {
  return `<svg width="${w}" height="${h}" viewBox="0 0 180 120" preserveAspectRatio="none" overflow="visible">
    <path class="${className}" data-slot="heart" vector-effect="non-scaling-stroke" pathLength="1" d="${HEART}"/>
    <text class="heart-tag" data-slot="tag" x="90" y="66" text-anchor="middle"></text>
  </svg>`;
}
