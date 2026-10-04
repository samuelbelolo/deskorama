/**
 * Returns a pigeon, 14 x 10 units, feet at y 10: a chalk body with an ink outline, so it reads on the dark runway,
 * a dark wing folded or raised, and orange feet.
 * @example
 * pigeonMarkup(true).includes('pigeon-wing-up'); // true
 */
export function pigeonMarkup(flapping: boolean): string {
  const wing = flapping
    ? '<path class="pigeon-wing pigeon-wing-up" d="M5,4 L1,-5 L10,2 Z"/>'
    : '<path class="pigeon-wing" d="M4,4 Q8,2 11,5 L5,6 Z"/>';

  return `<g class="pigeon">
    <path class="pigeon-body" d="M1,5 Q2,2 6,3 Q9,0 11,2 L13,2.6 L11,3.6 Q11,7 7,8 L3,8 Z"/>
    <circle class="pigeon-eye" cx="10.4" cy="2.4" r="0.6"/>
    ${wing}
    <path class="pigeon-leg" d="M6,8 V10 M8,8 V10"/>
  </g>`;
}
