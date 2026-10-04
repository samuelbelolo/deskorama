/**
 * Returns the card the security agent holds up: a chalk card with a cobalt head band, a big orange cross, and an
 * empty slot under it for the reason, as wide as `chars` capitals.
 * @example
 * stopCardMarkup(7).width; // 77
 */
export function stopCardMarkup(chars: number): { markup: string; width: number } {
  const width = Math.max(44, Math.round(chars * 9 + 14));
  const c = width / 2;

  const markup = `<svg width="${width}" height="54" viewBox="0 0 ${width} 54">
    <rect class="card" x="0.7" y="0.7" width="${width - 1.4}" height="52.6" rx="1.5"/>
    <rect class="card-head" x="0.7" y="0.7" width="${width - 1.4}" height="9" rx="1.5"/>
    <path class="stop-cross" d="M${c - 9},15 L${c + 9},33 M${c + 9},15 L${c - 9},33"/>
    <text class="card-text" data-slot="tag" x="${c}" y="48" text-anchor="middle"></text>
  </svg>`;

  return { markup, width };
}
