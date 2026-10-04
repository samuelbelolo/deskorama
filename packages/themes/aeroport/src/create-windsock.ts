import type { Cancel, ScreenHost } from '@deskorama/core';
import type { Layout } from './layout.ts';
import { lerp } from './lerp.ts';
import { svgMarkup } from './svg-markup.ts';
import { WINDSOCK, windsockMarkup } from './windsock-markup.ts';

/**
 * Returns the windsock by the runway and how to set it: limp when nobody is around, straight out when the crowd
 * reaches the Source's busiest hour. `share` is the crowd over its max, from 0 to 1. Its spot is reserved, so no
 * Gag hides it.
 * @example
 * const sock = createWindsock(root, host, layout);
 * sock.set(1); // straight out
 */
export function createWindsock(
  root: HTMLElement,
  host: ScreenHost,
  layout: Layout,
): { readonly set: (share: number) => void; readonly dispose: Cancel } {
  const node = document.createElement('div');
  node.className = 'aeroport-fixture';
  node.dataset['part'] = 'windsock';
  node.style.transform = `translate(${layout.windsock.x - 70}px, ${layout.windsock.baseY - WINDSOCK.h}px)`;
  node.append(svgMarkup(windsockMarkup()));
  root.append(node);

  const sock = node.querySelector('.sock');
  const release = host.reserve({ x: layout.windsock.x - 70, y: layout.windsock.baseY - WINDSOCK.h, ...WINDSOCK });

  return {
    set(share) {
      const angle = lerp(-72, -4, Math.min(1, Math.max(0, share)));
      const stretch = 0.75 + 0.25 * (1 + angle / 72);
      sock?.setAttribute('transform', `rotate(${angle.toFixed(1)}) scale(${stretch.toFixed(3)} 1)`);
    },
    dispose() {
      release();
      node.remove();
    },
  };
}
