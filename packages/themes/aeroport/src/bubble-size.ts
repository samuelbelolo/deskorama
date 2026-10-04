/** A speech bubble's type size, line height and padding, in pixels; the widths are estimated, never measured. */
const CHAR_WIDTH = 7.4;
const LINE_HEIGHT = 16;
const PADDING_X = 22;
const PADDING_Y = 12;

/**
 * Returns the box of a bubble for `line`: one line when it fits `maxWidth`, else wrapped to that width. A Gag uses
 * it to ask for room before it speaks.
 * @example
 * bubbleSize('Roger.', 280); // { w: 67, h: 28 }
 * bubbleSize('« Le bouton Exporter ne répond plus depuis la mise à jour »', 280).h; // 60
 */
export function bubbleSize(line: string, maxWidth: number): { w: number; h: number } {
  const natural = Math.ceil(line.length * CHAR_WIDTH + PADDING_X);
  const w = Math.min(natural, maxWidth);
  const lines = Math.ceil(natural / Math.max(1, w - PADDING_X / 2));

  return { w, h: lines * LINE_HEIGHT + PADDING_Y };
}
