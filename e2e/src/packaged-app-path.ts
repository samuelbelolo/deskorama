import { join } from 'node:path';

/**
 * Returns the path of the packaged app's executable, as `package:e2e` leaves it in apps/desktop/release.
 * @example
 * packagedAppPath(); // ".../apps/desktop/release/mac-arm64/Deskorama.app/Contents/MacOS/Deskorama"
 */
export function packagedAppPath(): string {
  const app = join(import.meta.dirname, '../../apps/desktop/release/mac-arm64/Deskorama.app');
  return join(app, 'Contents/MacOS/Deskorama');
}
