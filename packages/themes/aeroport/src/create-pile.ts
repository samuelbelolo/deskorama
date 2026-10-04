import { createRandom, type Cancel, type ScreenHost } from '@deskorama/core';
import { cartMarkup } from './cart-markup.ts';
import type { Layout } from './layout.ts';
import { pileSlots } from './pile-slots.ts';
import type { Strings } from './strings.ts';
import { svgMarkup } from './svg-markup.ts';

/** The suitcase colours of the pile. */
const CASES = ['case-a', 'case-b', 'case-c', 'case-d'] as const;

/** The seed of the pile's colours, so it looks the same on every run. */
const CASES_SEED = 3;

/** The rejected-baggage pile: one suitcase per rejection today, so it only grows until midnight. */
export interface Pile {
  readonly count: () => number;
  readonly setCount: (count: number) => void;
  readonly dispose: Cancel;
}

/**
 * Returns the baggage cart and the rejected-baggage pile beside it with its painted sign; the sign is reserved so
 * no Gag covers it.
 * @example
 * const pile = createPile(root, host, { layout, text });
 * pile.setCount(pile.count() + 1);
 */
export function createPile(
  root: HTMLElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly text: Strings },
): Pile {
  const { layout, text } = scene;
  const cart = svgMarkup(cartMarkup(layout.cart, layout.pile, text.paint.pileSign));
  const signWidth = Number(cart.querySelector('[data-part="pile-sign"]')?.getAttribute('width') ?? 62);

  const node = document.createElement('div');
  node.className = 'aeroport-fixture';
  node.dataset['part'] = 'pile';
  node.append(cart);
  root.append(node);

  const slots = pileSlots(layout.pile);
  const random = createRandom(CASES_SEED);
  const colours = slots.map(() => CASES[Math.floor(random.next() * CASES.length)] ?? CASES[0]);
  const heap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  cart.append(heap);

  let count = 0;
  const release = host.reserve({ x: layout.pile.x - 10, y: layout.cart.feetY - 88, w: signWidth, h: 24 });

  return {
    count: () => count,
    setCount(next) {
      count = Math.max(0, next);
      const shown = slots.slice(0, count).map((slot, i) => {
        const markup = `<svg><g transform="translate(${slot.x.toFixed(1)} ${slot.y.toFixed(1)}) rotate(${slot.r.toFixed(1)})">
          <rect class="${colours[i] ?? CASES[0]}" x="0" y="1.2" width="12" height="7.8" rx="1"/>
          <rect class="case-band" x="5.2" y="1.2" width="1.6" height="7.8"/></g></svg>`;
        return svgMarkup(markup).firstElementChild;
      });
      heap.replaceChildren(...shown.filter((group) => group !== null));
    },
    dispose() {
      release();
      node.remove();
    },
  };
}
