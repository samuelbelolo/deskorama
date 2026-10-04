/**
 * Returns the money sack, 34 x 36: a kraft bag tied at the neck, with an empty slot for the currency sign.
 * @example
 * sackMarkup().includes('data-slot="sign"'); // true
 */
export function sackMarkup(): string {
  return `<svg width="34" height="36" viewBox="0 0 34 36">
    <path class="sack" d="M12,8 C6,12 2,20 3,28 C4,34 30,34 31,28 C32,20 28,12 22,8 Z"/>
    <path class="sack" d="M11,3 L23,3 L21,8 L13,8 Z"/>
    <rect class="van-body" x="11" y="7" width="12" height="2.2"/>
    <text class="sack-sign" data-slot="sign" x="17" y="27" text-anchor="middle"></text>
  </svg>`;
}
