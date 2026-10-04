/** The pop of the amount over the sack. */
export const MONEY_POP = { w: 170, h: 52 } as const;

/**
 * Returns the pop that rises over the money sack: an empty slot for the amount in big orange capitals, and one for
 * the till's ring under it.
 * @example
 * moneyPopMarkup().includes('data-slot="ring"'); // true
 */
export function moneyPopMarkup(): string {
  const { w, h } = MONEY_POP;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <text class="money-tag" data-slot="tag" x="${w / 2}" y="30" text-anchor="middle"></text>
    <text class="money-ring" data-slot="ring" x="${w / 2}" y="47" text-anchor="middle"></text>
  </svg>`;
}
