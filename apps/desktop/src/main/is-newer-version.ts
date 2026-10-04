/**
 * Returns true when release tag `candidate` names a later version than `current`, comparing major, minor and
 * patch numbers. A leading "v" is ignored; a tag that is not a version is never newer.
 * @example
 * isNewerVersion('v0.3.0', '0.2.9'); // true
 * isNewerVersion('v0.10.0', '0.9.0'); // true
 * isNewerVersion('v0.2.0', '0.2.0'); // false
 */
export function isNewerVersion(candidate: string, current: string): boolean {
  const next = parts(candidate);
  const now = parts(current);
  if (next === null || now === null) return false;
  for (const [index, number] of next.entries()) {
    const other = now[index] ?? 0;
    if (number !== other) return number > other;
  }
  return false;
}

/**
 * Returns the major, minor and patch numbers of a version, or null when it is not one.
 * @example
 * parts('v1.2.3'); // [1, 2, 3]
 * parts('nightly'); // null
 */
function parts(version: string): number[] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  return match === null ? null : match.slice(1).map(Number);
}
