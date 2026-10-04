/**
 * Returns the paths present in one dictionary and missing from the other, in both directions, walking nested
 * objects and arrays. Two dictionaries with the same shape give an empty list.
 * @example
 * missingKeys({ a: 'x', b: { c: 'y' } }, { a: 'x', b: {} }); // ["b.c (missing from the second)"]
 */
export function missingKeys(first: unknown, second: unknown): string[] {
  return [...absent(first, second, '', 'the second'), ...absent(second, first, '', 'the first')];
}

/**
 * Returns the paths of `from` that `to` lacks, labelled with the name of `to`.
 * @example
 * absent({ a: 1 }, {}, '', 'the second'); // ["a (missing from the second)"]
 */
function absent(from: unknown, to: unknown, path: string, toName: string): string[] {
  if (!isBranch(from)) return [];
  const found: string[] = [];
  for (const [key, value] of Object.entries(from)) {
    const here = path === '' ? key : `${path}.${key}`;
    const other: unknown = isBranch(to) ? Object.entries(to).find(([otherKey]) => otherKey === key)?.[1] : undefined;
    if (other === undefined) found.push(`${here} (missing from ${toName})`);
    else found.push(...absent(value, other, here, toName));
  }
  return found;
}

/**
 * Returns true for a value that holds keys: an object or an array.
 * @example
 * isBranch({ a: 1 }); // true
 * isBranch('Prod-les-Bains'); // false
 */
function isBranch(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
