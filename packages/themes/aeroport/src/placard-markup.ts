/**
 * Returns a meet-and-greet placard on a short handle, as wide as `chars` capitals, with an empty slot for the word.
 * @example
 * placardMarkup(9).width; // 102
 */
export function placardMarkup(chars: number): { markup: string; width: number } {
  const width = Math.max(44, Math.round(chars * 9.5 + 16));

  const markup = `<svg width="${width}" height="34" viewBox="0 0 ${width} 34" overflow="visible">
    <rect class="handle" x="${width / 2 - 1}" y="20" width="2" height="14"/>
    <rect class="card" x="0.75" y="0.75" width="${width - 1.5}" height="20" rx="1"/>
    <text class="card-text" data-slot="tag" x="${width / 2}" y="15" text-anchor="middle"></text>
  </svg>`;

  return { markup, width };
}
