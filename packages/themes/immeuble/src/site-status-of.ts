import type { Copy } from './create-copy.ts';
import { SIGN_W } from './site-geometry.ts';
import type { SiteState } from './site-state.ts';
import type { SiteStatus } from './site-status.ts';
import { textWidth } from './text-width.ts';

/** How long the sign shows the delivery time before the tag, and back. */
const SWAP_MS = 3000;

/**
 * Returns the site sign's status line for the crane's state, in plain words: what it is doing, when the last deploy
 * went live, every other three seconds that deploy's own tag, and a red line after a failure.
 * @example
 * siteStatusOf(copy, { phase: 'building', ... }, 1200); // { line: 'MISE EN LIGNE...', alarm: false, blink: true }
 */
export function siteStatusOf(copy: Copy, state: SiteState, now: number): SiteStatus {
  const site = copy.text.site;
  if (state.phase === 'failed') return { line: site.idle, alarm: true, blink: false };

  if (state.phase === 'building') {
    const dots = '...'.slice(0, Math.floor(now / 400) % 4).padEnd(3, ' ');
    return { line: `${site.building}${dots}`, alarm: false, blink: Math.floor(now / 500) % 2 === 0 };
  }

  const { delivery } = state;
  if (delivery === null) return { line: site.idle, alarm: false, blink: false };

  const tagFits = delivery.tag !== '' && textWidth(delivery.tag) <= SIGN_W - 8;
  const line =
    tagFits && Math.floor(now / SWAP_MS) % 2 === 1 ? delivery.tag : copy.fill(site.live, { time: delivery.time });

  return { line, alarm: false, blink: false };
}
