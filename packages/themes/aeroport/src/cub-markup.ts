/** The Cub's drawing, in units: 72 x 34, wheels at y 28.5. */
export const CUB = { w: 72, h: 34, wheels: 28.5 } as const;

/**
 * Returns a Piper Cub facing right: chalk fuselage, its high wing as a sheared plank seen from above (shade far
 * half, cobalt near half, light leading edge), struts, wheels, the blur of its propeller, and an empty tag plate on
 * the fuselage that a Gag fills with the Event's tag as plain text.
 * @example
 * cubMarkup(1.6).includes('data-slot="tag"'); // true
 */
export function cubMarkup(scale: number): string {
  return `<svg width="${CUB.w * scale}" height="${CUB.h * scale}" viewBox="0 0 72 34" overflow="visible">
    <path class="cub-tail" d="M6,14 L2,4 L10,4 L16,13 Z"/>
    <path class="cub-body" d="M6,14 L50,11 C56,11 60,13 62,16 L58,20 L10,18 Z"/>
    <path class="cub-wing-shade" d="M19,1 L51,1 L55,7.5 L23,7.5 Z"/>
    <path class="cub-wing" d="M23,7.5 L55,7.5 L59,13 L27,13 Z"/>
    <path class="cub-wing-hi" d="M51.6,1.6 L58.4,12.4"/>
    <path class="strut-line" d="M38,13 L41,17 M46,20 L44,25 M52,20 L54,25"/>
    <rect class="cub-window" x="44" y="13.4" width="7" height="3.4"/>
    <text class="cub-tag" data-slot="tag" x="26" y="17.4" text-anchor="middle"></text>
    <circle class="wheel" cx="44" cy="26" r="2.6"/><circle class="wheel" cx="54" cy="26" r="2.6"/>
    <ellipse class="prop" cx="64" cy="16" rx="1.6" ry="8"/>
  </svg>`;
}
