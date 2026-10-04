/**
 * Returns one orange coin, 14 x 14: orange, never gold, which belongs to the celebration alone.
 * @example
 * coinMarkup().includes('class="coin"'); // true
 */
export function coinMarkup(): string {
  return '<svg width="14" height="14" viewBox="0 0 14 14"><circle class="coin" cx="7" cy="7" r="6"/></svg>';
}
