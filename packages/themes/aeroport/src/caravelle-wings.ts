/**
 * The Caravelle's wings seen slightly from above, in flat poster tones: the far wingtip in shade over the
 * fuselage, then the near wing swept back along the belly with the shadow it casts on the hull, its light cobalt
 * top (clearly off the hull's chalk), the dark flap band, the cobalt leading edge and one chalk highlight. Every
 * coordinate is in the plane's own 300 x 86 viewBox.
 */
export const CARAVELLE_WINGS = {
  far: '<path class="wing-shade" d="M134,44 L192,44 L143,25 L121,25 Z"/>',
  near: `<path class="wing-cast" d="M116,48.5 H210 C205,52 199,55 194,56 H130 C124,54 119,51.5 116,48.5 Z"/>
    <path class="wing-top" d="M132,54.5 L194,54.5 L143,76 L119,76 Z"/>
    <path class="wing-shade" d="M132,54.5 L143,54.5 L129,76 L119,76 Z"/>
    <path class="wing-edge" d="M194,54.5 L143,76 L138,76 L187.5,54.5 Z"/>
    <path class="wing-hi" d="M183.5,56.8 L140.5,74.8"/>`,
} as const;
