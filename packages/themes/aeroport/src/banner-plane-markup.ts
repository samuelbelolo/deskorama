import { CUB } from './cub-markup.ts';

/** Between the banner's end and the Cub's tail, in units. */
const ROPE = 30;

/**
 * Returns a Cub towing a banner on the left, wide enough for `chars` characters, with an empty text slot a Gag
 * fills with the Event's tag as plain text. The total width is returned with it.
 * @example
 * bannerPlaneMarkup(2).width; // 190
 */
export function bannerPlaneMarkup(chars: number): { markup: string; width: number } {
  const bannerW = Math.max(90, chars * 9 + 24);
  const px = bannerW + ROPE;
  const width = px + CUB.w;

  const markup = `<svg width="${width}" height="34" viewBox="0 0 ${width} 34" overflow="visible">
    <rect class="banner" x="0" y="8" width="${bannerW}" height="20"/>
    <text class="banner-text" data-slot="tag" x="${bannerW / 2}" y="22.5" text-anchor="middle"></text>
    <path class="banner-rope" d="M${bannerW},18 L${px + 8},16"/>
    <g transform="translate(${px} 0)">
      <path class="cub-tail" d="M6,14 L2,4 L10,4 L16,13 Z"/>
      <path class="cub-body" d="M6,14 L50,11 C56,11 60,13 62,16 L58,20 L10,18 Z"/>
      <path class="cub-wing-shade" d="M19,1 L51,1 L55,7.5 L23,7.5 Z"/>
      <path class="cub-wing" d="M23,7.5 L55,7.5 L59,13 L27,13 Z"/>
      <path class="cub-wing-hi" d="M51.6,1.6 L58.4,12.4"/>
      <path class="strut-line" d="M38,13 L41,17 M46,20 L44,25 M52,20 L54,25"/>
      <circle class="wheel" cx="44" cy="26" r="2.6"/><circle class="wheel" cx="54" cy="26" r="2.6"/>
      <ellipse class="prop" cx="64" cy="16" rx="1.6" ry="8"/>
    </g>
  </svg>`;

  return { markup, width };
}
