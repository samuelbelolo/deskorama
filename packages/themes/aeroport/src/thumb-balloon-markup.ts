/** The thumb balloon's height, string included. */
export const THUMB_HEIGHT = 84;

/**
 * Returns a balloon shaped like a big thumbs-up, in orange with an ink outline, a chalk cuff with an empty slot for
 * the tag, and its string. A thumb, never a heart: a like must not look like an approval.
 * @example
 * thumbBalloonMarkup(4).width; // 48
 */
export function thumbBalloonMarkup(chars: number): { markup: string; width: number } {
  const width = Math.max(46, Math.round(chars * 8.5 + 14));
  const c = width / 2;

  const markup = `<svg width="${width}" height="${THUMB_HEIGHT}" viewBox="0 0 ${width} ${THUMB_HEIGHT}" overflow="visible">
    <path class="thumb" d="M${c - 6},20 L${c - 6},6 C${c - 6},1 ${c + 4},1 ${c + 4},6 L${c + 4},18 L${c + 14},18
      C${c + 19},18 ${c + 20},23 ${c + 18},26 C${c + 21},28 ${c + 20},33 ${c + 17},34 C${c + 20},36 ${c + 18},41 ${c + 15},42
      L${c - 12},42 L${c - 12},20 Z"/>
    <path class="balloon-string" d="M${c + 2},26 H${c + 15} M${c + 2},34 H${c + 14}"/>
    <rect class="thumb-cuff" x="0.6" y="43" width="${width - 1.2}" height="16" rx="2"/>
    <text class="thumb-text" data-slot="tag" x="${c}" y="55" text-anchor="middle"></text>
    <path class="balloon-string" d="M${c},59 C${c - 4},66 ${c + 4},74 ${c},${THUMB_HEIGHT}"/>
  </svg>`;

  return { markup, width };
}
