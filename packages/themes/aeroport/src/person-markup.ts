/** What a passenger carries. */
type Bag = 'roller' | 'flight' | 'radio' | null;

/** How a passenger looks: coat and skin colours, a hat, a bag, and a stride for walking. */
export interface Look {
  readonly coat: string;
  readonly skin: string;
  readonly hat?: boolean;
  readonly bag?: Bag;
  /** Stride offset of the legs, in units; 0 when standing. */
  readonly legs?: number;
}

/** The skins and coats people are drawn with, in the poster's inks. */
export const SKINS = ['#e8c3a4', '#c48e68', '#8a5a3c', '#f0d2b8'] as const;
export const COATS = ['var(--cobalt)', 'var(--ink)', '#6b7a89', '#4f6b5e', '#8c9aa6'] as const;

/**
 * Returns a flat 1960s poster passenger, feet at y 26 in a 20 x 26 box: two legs, a coat, a head, maybe a hat and
 * a bag. Colours are written by the Theme, never by an Event.
 * @example
 * personMarkup({ coat: 'var(--cobalt)', skin: '#e8c3a4', bag: 'roller' }).startsWith('<g'); // true
 */
export function personMarkup(look: Look): string {
  const legs = look.legs ?? 0;
  const hat =
    look.hat === true
      ? '<rect class="hat" x="3.4" y="0" width="7.2" height="2.6"/><rect class="hat" x="2" y="2.2" width="10" height="1.2"/>'
      : '';

  return `<g class="person">
    <rect class="leg" x="${3.6 - legs}" y="18" width="2.6" height="8"/>
    <rect class="leg" x="${7.8 + legs}" y="18" width="2.6" height="8"/>
    <path d="M3,8.5 L11,8.5 L12.6,19 L1.4,19 Z" style="fill:${look.coat}"/>
    <circle cx="7" cy="4.8" r="3.4" style="fill:${look.skin}"/>
    ${hat}
    ${bagMarkup(look.bag ?? null)}
  </g>`;
}

/** What each bag looks like: a roller case, a flight bag, or a handheld radio held to the face. */
const BAGS: Readonly<Record<NonNullable<Bag>, string>> = {
  roller:
    '<path class="bag-handle" d="M13,13 V18"/><rect class="suitcase" x="12.5" y="17.5" width="6" height="8" rx="1"/>' +
    '<circle class="wheel" cx="14" cy="26" r="0.9"/><circle class="wheel" cx="17.4" cy="26" r="0.9"/>',
  flight: '<rect class="flight-bag" x="11" y="15" width="6.5" height="6" rx="0.8"/>',
  radio:
    '<path class="radio-arm" d="M10,10 L11.5,5.5"/><rect class="radio-set" x="10.4" y="1" width="3" height="6" rx="0.6"/>' +
    '<path class="radio-aerial" d="M12.6,1 V-3.5"/>',
};

/**
 * Returns what a passenger carries, or nothing.
 * @example
 * bagMarkup('radio').includes('radio-set'); // true
 * bagMarkup(null); // ""
 */
function bagMarkup(bag: Bag): string {
  return bag === null ? '' : BAGS[bag];
}
