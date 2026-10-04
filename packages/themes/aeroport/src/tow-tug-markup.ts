/** The tow tractor's drawing, in units, facing left with its tow bar out in front. */
export const TOW_TUG = { w: 62, h: 30 } as const;

/**
 * Returns the little tow tractor that hauls a stranded plane off the runway: a cobalt body, a cab, two wheels, and
 * the tow bar sticking out on the left.
 * @example
 * towTugMarkup(1.5).includes('tow-bar'); // true
 */
export function towTugMarkup(scale: number): string {
  return `<svg width="${TOW_TUG.w * scale}" height="${TOW_TUG.h * scale}" viewBox="0 0 62 30">
    <rect class="tow-bar" x="0" y="20" width="16" height="3"/>
    <rect class="tug-body" x="14" y="12" width="44" height="12" rx="2"/>
    <path class="tug-body" d="M34,12 V2 H50 V12 Z"/>
    <rect class="truck-window" x="37" y="4" width="10" height="7"/>
    <circle class="wheel" cx="22" cy="25" r="5"/><circle class="wheel" cx="50" cy="25" r="5"/>
  </svg>`;
}
