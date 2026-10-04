import type { FakeScreenHost } from '@deskorama/test-utils';

/**
 * Steps the Clock until the playing Gag has drawn its last frame, and returns how long that took, at most `limit`.
 * @example
 * playUntilGagEnds(host, layer); // 4800
 */
export function playUntilGagEnds(host: FakeScreenHost, layer: HTMLElement, limit = 12_000): number {
  const step = 100;
  let elapsed = 0;

  while (elapsed < limit && layer.querySelector('[data-gag]') !== null) {
    host.clock.advance(step);
    elapsed += step;
  }

  return elapsed;
}
