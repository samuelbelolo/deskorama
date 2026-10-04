import { xmlText } from './xml-text.ts';

/** The fire truck's drawing, in units, facing left: its size, its wheels, and the tip of its foam nozzle. */
export const FIRE_TRUCK = { w: 164, h: 74, wheels: 72, nozzle: { x: 52, y: 9 } } as const;

/**
 * Returns the airport's fire truck facing left: the orange body with a chalk stripe and its word painted on the
 * side, the light bar whose two lamps blink in turn, the foam turret and nozzle, the ladder and three wheels.
 * @example
 * fireTruckMarkup('POMPIERS', 1.15).includes('light-a'); // true
 */
export function fireTruckMarkup(word: string, scale: number): string {
  return `<svg width="${FIRE_TRUCK.w * scale}" height="${FIRE_TRUCK.h * scale}" viewBox="0 0 164 74">
    <rect class="truck-body" x="26" y="24" width="134" height="34" rx="2"/>
    <path class="truck-body" d="M4,30 L12,16 H40 V58 H4 Z"/>
    <path class="truck-window" d="M9,30 L15,20 H36 V30 Z"/>
    <rect class="truck-stripe" x="4" y="44" width="156" height="5"/>
    <text class="truck-text" x="100" y="40" text-anchor="middle">${xmlText(word)}</text>
    <rect class="truck-bar" x="12" y="10" width="24" height="6"/>
    <circle class="truck-light light-a" cx="17" cy="9" r="3.4"/><circle class="truck-light light-b" cx="31" cy="9" r="3.4"/>
    <rect class="truck-turret" x="62" y="14" width="18" height="10"/>
    <path class="truck-nozzle" d="M64,16 L50,7 L52,4 L68,13 Z"/>
    <rect class="truck-ladder" x="88" y="18" width="62" height="5"/>
    <circle class="wheel" cx="26" cy="62" r="10"/><circle class="wheel" cx="112" cy="62" r="10"/><circle class="wheel" cx="138" cy="62" r="10"/>
    <circle class="hub" cx="26" cy="62" r="3.5"/><circle class="hub" cx="112" cy="62" r="3.5"/><circle class="hub" cx="138" cy="62" r="3.5"/>
  </svg>`;
}
