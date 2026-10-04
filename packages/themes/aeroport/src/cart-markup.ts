import { xmlText } from './xml-text.ts';

/**
 * Returns the baggage cart with its load, and the sign planted by the pile, as wide as its longer line, in screen
 * pixels. The sign is marked `data-part="pile-sign"` so its room can be reserved.
 * @example
 * cartMarkup({ x: 84, feetY: 738 }, { x: 16, feetY: 740 }, ['rejected', 'baggage']).includes('baggage'); // true
 */
export function cartMarkup(
  cart: { readonly x: number; readonly feetY: number },
  pile: { readonly x: number },
  words: readonly [string, string],
): string {
  const { x, feetY: y } = cart;
  const signW = Math.max(62, Math.ceil(Math.max(words[0].length, words[1].length) * 5.6) + 14);

  const load = (
    [
      [0, 0, 'case-a'],
      [13, 0, 'case-b'],
      [26, 0, 'case-d'],
      [6, -8, 'case-c'],
      [19, -8, 'case-a'],
      [50, 0, 'case-b'],
      [63, 0, 'case-a'],
      [56, -8, 'case-d'],
    ] as const
  )
    .map(([dx, dy, cls]) => `<rect class="${cls}" x="${x + 4 + dx}" y="${y - 20 + dy}" width="12" height="8" rx="1"/>`)
    .join('');

  return `<svg width="${x + 100}" height="${y + 4}" viewBox="0 0 ${x + 100} ${y + 4}" overflow="visible">
    <rect class="trolley" x="${x}" y="${y - 12}" width="40" height="3"/><rect class="trolley" x="${x + 46}" y="${y - 12}" width="40" height="3"/>
    <rect class="trolley" x="${x + 38}" y="${y - 10}" width="10" height="1.5"/>
    ${load}
    <circle class="wheel" cx="${x + 6}" cy="${y - 4}" r="3.6"/><circle class="wheel" cx="${x + 34}" cy="${y - 4}" r="3.6"/>
    <circle class="wheel" cx="${x + 52}" cy="${y - 4}" r="3.6"/><circle class="wheel" cx="${x + 80}" cy="${y - 4}" r="3.6"/>
    <rect class="pile-post" x="${pile.x - 4}" y="${y - 66}" width="2" height="66"/>
    <rect class="pile-sign" data-part="pile-sign" x="${pile.x - 10}" y="${y - 88}" width="${signW}" height="24" rx="1"/>
    <text class="pile-sign-text" x="${pile.x - 4}" y="${y - 78.5}">${xmlText(words[0])}</text>
    <text class="pile-sign-text" x="${pile.x - 4}" y="${y - 68.5}">${xmlText(words[1])}</text>
  </svg>`;
}
