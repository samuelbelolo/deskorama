/** A ground crew member's free arm: raised to wave, held out, or down. */
export type Arm = 'up' | 'out' | null;

/**
 * Returns a ground crew member, feet at y 26: cobalt overalls, a chalk vest band, ear defenders, one arm free.
 * @example
 * crewMarkup('up').includes('crew-arm'); // true
 */
export function crewMarkup(arm: Arm): string {
  const arms = { up: '<path class="crew-arm" d="M11,10 L15,2"/>', out: '<path class="crew-arm" d="M11,10 L18,9"/>' };

  return `<g class="person crew">
    <rect class="leg" x="3.6" y="18" width="2.6" height="8"/><rect class="leg" x="7.8" y="18" width="2.6" height="8"/>
    <path class="crew-suit" d="M3,8.5 L11,8.5 L12,19 L2,19 Z"/>
    <rect class="crew-vest" x="2.6" y="12" width="9" height="2.2"/>
    <circle cx="7" cy="4.8" r="3.4" style="fill:#c48e68"/>
    <rect class="ear" x="2.6" y="3.4" width="2" height="3.2"/><rect class="ear" x="9.4" y="3.4" width="2" height="3.2"/>
    ${arm === null ? '' : arms[arm]}
  </g>`;
}
