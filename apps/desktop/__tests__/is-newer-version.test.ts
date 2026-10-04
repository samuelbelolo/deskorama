import { expect, test } from 'vitest';
import { isNewerVersion } from '../src/main/is-newer-version.ts';

test('a release is newer when its major, minor or patch number is higher, compared as numbers', () => {
  expect(isNewerVersion('v0.3.0', '0.2.9')).toBe(true);
  expect(isNewerVersion('v0.10.0', '0.9.0')).toBe(true);
  expect(isNewerVersion('v1.0.0', '0.99.99')).toBe(true);
  expect(isNewerVersion('v0.2.0', '0.2.0')).toBe(false);
  expect(isNewerVersion('v0.1.9', '0.2.0')).toBe(false);
  expect(isNewerVersion('nightly', '0.2.0')).toBe(false);
});
