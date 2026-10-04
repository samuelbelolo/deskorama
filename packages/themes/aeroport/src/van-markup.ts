import { xmlText } from './xml-text.ts';

/** The cash van's drawing, facing left: 130 x 54, wheels at y 52. */
export const VAN = { w: 130, h: 54 } as const;

/**
 * Returns the armoured cash van facing left: an ink body, a chalk band painted with the airport's word for it, a
 * barred window, and an orange roundel with an empty slot for the currency sign.
 * @example
 * vanMarkup('FONDS').includes('FONDS'); // true
 */
export function vanMarkup(word: string): string {
  return `<svg width="${VAN.w}" height="${VAN.h}" viewBox="0 0 130 54" overflow="visible">
    <path class="van-body" d="M4,44 V24 L16,10 H38 V4 H126 V44 Z"/>
    <path class="van-window" d="M9,24 L18,13 H33 V24 Z"/>
    <rect class="van-band" x="38" y="28" width="88" height="9"/>
    <text class="van-text" x="64" y="35.4" text-anchor="middle">${xmlText(word)}</text>
    <circle class="van-roundel" cx="104" cy="17" r="10"/>
    <text class="van-sign" data-slot="sign" x="104" y="22" text-anchor="middle"></text>
    <circle class="wheel" cx="22" cy="46" r="6"/><circle class="wheel" cx="108" cy="46" r="6"/>
  </svg>`;
}
