/** The golden jet's drawing, in units, facing right: its size and where its wheels touch the ground. */
export const GOLDEN_JET = { w: 140, h: 50, wheels: 39.5 } as const;

/** The golden jet flies at more than twice its size: a celebration outranks everything else on the poster. */
export const GOLDEN_SCALE = 2.2;

/**
 * A celebration is rare: it waits longer than an everyday Gag for the sky or the runway to clear, though not so long
 * that the Gags queued behind it are lost.
 */
export const GOLDEN_PATIENCE = 20_000;

/**
 * Returns the golden private jet, a little Falcon facing right and the only gold on the poster: gold hull and wings
 * seen slightly from above, a row of round windows, a heart on its tail, and its gear in a group that a Gag shows or
 * hides for a gear-up pass.
 * @example
 * goldenJetMarkup(2.2).includes('jet-gear'); // true
 */
export function goldenJetMarkup(scale: number): string {
  let windows = '';
  for (let x = 58; x < 104; x += 9) windows += `<ellipse class="jet-window" cx="${x}" cy="21.5" rx="2.4" ry="2"/>`;

  return `<svg width="${GOLDEN_JET.w * scale}" height="${GOLDEN_JET.h * scale}" viewBox="0 0 140 50" overflow="visible">
    <path class="gold-dark" d="M14,21 L4,2 C4,1 5,0 7,0 L15,0 L34,17 Z"/>
    <path class="gold-dark" d="M2,10 L22,10 L25,12.5 L6,13 Z"/>
    <path class="gold-dark" d="M62,24 L94,24 L73,8 L62,8 Z"/>
    <path class="gold" d="M8,24 C8,19 13,16 20,16 L110,16 C122,16 132,20 137,25 C133,28 126,30 116,30 L20,30 C13,30 8,28 8,24 Z"/>
    <path class="gold-dark" d="M10,25 H128 C124,26.5 120,27 116,27 H12 Z"/>
    <rect class="gold-light" x="26" y="9" width="26" height="9" rx="4.5"/>
    ${windows}
    <path class="cockpit" d="M118,19 L127,20 L131,23.5 L121,23 Z"/>
    <path class="gold" d="M61,27.5 L95,27.5 L75,42 L62,42 Z"/>
    <path class="gold-dark" d="M61,27.5 L67,27.5 L66,42 L62,42 Z"/>
    <path class="jet-wing-hi" d="M93,28.6 L76,40.6"/>
    <g class="jet-gear" data-slot="gear">
      <rect class="strut" x="71" y="30" width="2" height="6"/><rect class="strut" x="116" y="28" width="1.6" height="7"/>
      <circle class="wheel" cx="72" cy="37" r="2.6"/><circle class="wheel" cx="117" cy="36" r="2.2"/>
    </g>
    <path class="jet-heart" d="M13,11 C10,8.5 6.5,6.5 6.5,4 C6.5,2.4 7.8,1.4 9.2,1.4 C10.6,1.4 12,2.4 13,3.8 C14,2.4 15.4,1.4 16.8,1.4 C18.2,1.4 19.5,2.4 19.5,4 C19.5,6.5 16,8.5 13,11 Z"/>
  </svg>`;
}
