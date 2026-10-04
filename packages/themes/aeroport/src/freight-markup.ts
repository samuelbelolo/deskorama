/** The tug and its cart measure 150 x 44 at scale 1. */
export const FREIGHT = { w: 150, h: 44 } as const;

/** Where the crate's top centre sits in the drawing, for the Caption. */
export const CRATE_TOP_CENTRE = { x: 102, y: 4 } as const;

/**
 * Returns the tug, facing left, pulling a flat cart with a crate whose stencil slot (`data-slot="crate"`) takes the
 * Source's name, and an orange "?" sticker when nobody described the Event's kind.
 * @example
 * freightMarkup(true).includes('data-part="sticker"'); // true
 */
export function freightMarkup(unrecognised: boolean): string {
  const sticker = unrecognised
    ? `<circle class="sticker" data-part="sticker" cx="138" cy="6" r="7"/>
       <text class="sticker-mark" x="138" y="10" text-anchor="middle">?</text>`
    : '';

  return `<svg width="${FREIGHT.w}" height="${FREIGHT.h}" viewBox="0 0 ${FREIGHT.w} ${FREIGHT.h}" overflow="visible">
    <rect class="tug-body" x="2" y="24" width="40" height="11" rx="2"/>
    <path class="tug-body" d="M20,24 V14 H34 V24 Z"/>
    <rect class="tug-window" x="23" y="16" width="8" height="6"/>
    <rect class="trolley" x="40" y="31" width="16" height="2"/>
    <rect class="trolley" x="56" y="30" width="90" height="3"/>
    <rect class="crate" x="62" y="4" width="80" height="26" rx="1"/>
    <rect class="crate-plate" x="70" y="9" width="64" height="16"/>
    <text class="aeroport-crate-label" data-part="crate-label" data-slot="crate" x="102" y="21" text-anchor="middle"></text>
    <circle class="wheel" cx="10" cy="37" r="4"/><circle class="wheel" cx="34" cy="37" r="4"/>
    <circle class="wheel" cx="64" cy="36" r="3"/><circle class="wheel" cx="138" cy="36" r="3"/>
    ${sticker}
  </svg>`;
}
