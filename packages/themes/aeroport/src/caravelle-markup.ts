import { CARAVELLE_WINGS } from './caravelle-wings.ts';
import { xmlText } from './xml-text.ts';

/** The Caravelle's drawing, in units: 300 wide, wheels at y 81. */
export const CARAVELLE = { w: 300, h: 86, wheels: 81 } as const;

/**
 * Returns a Sud Aviation Caravelle in the Air Prod livery, facing left as it stands on the stand: rear engines,
 * triangular windows, the relief wings, and a flat shadow on the apron. Only the shapes are mirrored, so the
 * painted title reads the right way.
 * @example
 * caravelleMarkup('AIR PROD', 1.5).includes('wing-top'); // true
 */
export function caravelleMarkup(title: string, scale: number): string {
  let windows = '';
  for (let x = 66; x < 238; x += 8.5) windows += `<path class="plane-window" d="M${x},44.6 h4.4 l-2.2,3.2 z"/>`;

  return `<svg width="${CARAVELLE.w * scale}" height="${CARAVELLE.h * scale}" viewBox="0 0 300 86" overflow="visible">
    <g transform="translate(300 0) scale(-1 1)">
      <path class="ground-shadow" d="M40,80 H272 L258,88 H54 Z M122,79 H206 L156,92 H112 Z"/>
      <path class="fin" d="M18,40 L6,6 C6,4 8,3 10,3 L22,3 L52,35 Z"/>
      <circle class="tail-logo" cx="19" cy="14" r="5.5"/>
      <path class="stabilizer" d="M3,21 L36,21 L40,24 L9,25 Z"/>
      ${CARAVELLE_WINGS.far}
      <path class="hull" d="M16,46 C16,39 23,34 34,34 L248,34 C268,34 284,40 293,47 C297,50 298,52 296,53 C288,56 276,58 262,58 L34,58 C23,58 16,53 16,46 Z"/>
      <path class="belly" d="M21,55.5 H272 C268,57 264,58 262,58 H34 C28,58 24,57 21,55.5 Z"/>
      <path class="cheatline" d="M20,43.5 H262 C276,43.5 288,46.5 295,50.5 L293.5,52.5 C285,49.5 275,48.5 262,48.5 H18.2 C18.5,46.5 19,45 20,43.5 Z"/>
      ${windows}
      <path class="cockpit" d="M272,40.5 L283,41.5 L288,45.5 L275,45 Z"/>
      <rect class="plane-door" x="250" y="36" width="8" height="17"/>
      <rect class="engine-pylon" x="60" y="36" width="14" height="5"/>
      <rect class="engine" x="42" y="27" width="46" height="13" rx="6.5"/>
      <rect class="engine-intake" x="84" y="27" width="5" height="13" rx="2.5"/>
      <rect class="engine-exhaust" x="39" y="29.5" width="5" height="8"/>
      ${CARAVELLE_WINGS.near}
      <rect class="strut" x="149" y="58" width="3" height="13"/><rect class="strut" x="260" y="57" width="2.6" height="15"/>
      <circle class="wheel" cx="145" cy="75.5" r="5.2"/><circle class="wheel" cx="156" cy="75.5" r="5.2"/><circle class="wheel" cx="261" cy="76.8" r="4.2"/>
    </g>
    <text class="plane-title" x="230" y="41.6" text-anchor="end">${xmlText(title)}</text>
    <text class="plane-tail" x="281" y="16.6" text-anchor="middle">P</text>
  </svg>`;
}
