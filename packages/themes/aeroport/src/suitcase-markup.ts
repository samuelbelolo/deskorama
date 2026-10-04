/**
 * Returns a big suitcase with a luggage tag on a string from its handle, as wide as `chars` capitals, with an empty
 * slot for the tag's word. The tag is inside the drawing's box, so the box is all the room it takes.
 * @example
 * suitcaseMarkup(8).width; // 105
 */
export function suitcaseMarkup(chars: number): { markup: string; width: number; height: number } {
  const tag = Math.max(46, Math.round(chars * 7.6 + 12));
  const width = 32 + tag;
  const height = 54;

  const markup = `<svg width="${width}" height="${height}" viewBox="0 -26 ${width} ${height}">
    <path class="bag-handle" d="M12,4 V0 H24 V4" style="stroke-width:2"/>
    <rect class="case-a" x="0" y="4" width="36" height="24" rx="3"/>
    <rect class="case-band" x="15.5" y="4" width="5" height="24"/>
    <path class="tag-string" d="M24,1 L34,-10"/>
    <rect class="card" x="30" y="-24" width="${tag}" height="15" rx="2"/>
    <text class="card-text" data-slot="tag" x="${30 + tag / 2}" y="-12.5" text-anchor="middle" style="font-size:11px"></text>
  </svg>`;

  return { markup, width, height };
}
