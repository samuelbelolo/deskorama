/** A figure's drawing box, in units: people and bots stand in 24 x 30 with room above for hats and antennas. */
export const FIGURE_BOX = { w: 24, h: 30 } as const;

/**
 * Returns the `<svg>` markup of one figure at `scale`, facing right or mirrored to face left, its feet at the
 * bottom of the box.
 * @example
 * figureSvg(crewMarkup('up'), 1.4, false); // '<svg width="33.6" height="42" ...'
 */
export function figureSvg(inner: string, scale: number, facingLeft: boolean): string {
  const w = FIGURE_BOX.w * scale;
  const h = FIGURE_BOX.h * scale;
  const flip = facingLeft ? 'transform="translate(18 0) scale(-1 1)"' : '';

  return `<svg width="${w}" height="${h}" viewBox="-2 -4 ${FIGURE_BOX.w} ${FIGURE_BOX.h}" overflow="visible"><g ${flip}>${inner}</g></svg>`;
}
