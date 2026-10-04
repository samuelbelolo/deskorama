import type { Random } from '@deskorama/core';

/**
 * Returns one element of a non-empty list, drawn with the seeded generator.
 * @example
 * pick(createRandom(1), ['Nantes', 'Lille']); // "Lille" or "Nantes", the same for the same seed
 */
export function pick<Item>(random: Random, list: readonly Item[]): Item {
  const item = list[Math.floor(random.next() * list.length)];
  if (item === undefined) throw new Error('A fictional Source has an empty list to draw from.');

  return item;
}
