/** The windsock's drawing box, its pole's foot at the bottom right. */
export const WINDSOCK = { w: 90, h: 76 } as const;

/**
 * Returns the windsock: a pole and four orange and chalk rings in a `.sock` group that turns with the crowd.
 * @example
 * windsockMarkup().includes('class="sock"'); // true
 */
export function windsockMarkup(): string {
  return `<svg width="${WINDSOCK.w}" height="${WINDSOCK.h}" viewBox="-70 -6 90 76" overflow="visible">
    <rect class="sock-pole" x="-1.5" y="0" width="3" height="70"/>
    <g class="sock" transform="rotate(-70)">
      <path class="sock-a" d="M0,-1 L-15,0.5 L-15,11.5 L0,13 Z"/>
      <path class="sock-b" d="M-15,0.5 L-29,2 L-29,10 L-15,11.5 Z"/>
      <path class="sock-a" d="M-29,2 L-42,3.4 L-42,8.6 L-29,10 Z"/>
      <path class="sock-b" d="M-42,3.4 L-54,4.6 L-54,7.4 L-42,8.6 Z"/>
    </g>
  </svg>`;
}
