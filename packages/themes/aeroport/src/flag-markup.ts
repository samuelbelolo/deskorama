/** The flagpole's height, in pixels. */
export const POLE_HEIGHT = 96;

/**
 * Returns the flagpole with a flag as wide as `chars` characters, hoisted by moving its `.flag` group, and an empty
 * slot on the flag for the word.
 * @example
 * flagMarkup(6).width; // 95
 */
export function flagMarkup(chars: number): { markup: string; width: number } {
  const cloth = Math.max(64, Math.round(chars * 10 + 20));
  const width = cloth + 15;

  const markup = `<svg width="${width}" height="${POLE_HEIGHT}" viewBox="0 0 ${width} ${POLE_HEIGHT}" overflow="visible">
    <rect class="pole" x="0" y="0" width="3" height="${POLE_HEIGHT}"/><circle class="pole" cx="1.5" cy="0" r="2.5"/>
    <g class="flag">
      <path class="flag-cloth" d="M3,3 H${cloth + 3} L${cloth - 5},18 L${cloth + 3},33 H3 Z"/>
      <text class="flag-text" data-slot="tag" x="${(cloth - 5) / 2 + 3}" y="23" text-anchor="middle"></text>
    </g>
  </svg>`;

  return { markup, width };
}
