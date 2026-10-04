import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Returns true when `given` equals `expected`, in a time that does not depend on where they differ. Both are hashed
 * first, so their lengths leak nothing either.
 * @example
 * isSameSecret('s3cret-from-the-script', 's3cret-from-the-script'); // true
 * isSameSecret('guess', 's3cret-from-the-script'); // false
 */
export function isSameSecret(given: string, expected: string): boolean {
  return timingSafeEqual(digest(given), digest(expected));
}

/**
 * Returns the SHA-256 digest of a string.
 * @example
 * digest('abc').length; // 32
 */
function digest(text: string): Buffer {
  return createHash('sha256').update(text, 'utf8').digest();
}
