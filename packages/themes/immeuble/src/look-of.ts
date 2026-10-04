/**
 * Returns a whole number for an Event's id, to dress the same Event's actor the same way every time.
 * @example
 * lookOf('tramlo-pr-418-merged'); // 2094
 */
export function lookOf(id: string): number {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);

  return sum;
}
