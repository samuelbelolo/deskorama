import { createRandom, type Cancel, type Random, type Rect, type ScreenHost } from '@deskorama/core';
import { CARAVELLE, caravelleMarkup } from './caravelle-markup.ts';
import { figureSvg } from './figure-svg.ts';
import type { Layout } from './layout.ts';
import { COATS, personMarkup, SKINS } from './person-markup.ts';
import { stairsMarkup } from './stairs-markup.ts';
import { svgMarkup } from './svg-markup.ts';

/** The seed of the queue's looks, so the same people queue on every screen and every run. */
const LOOKS_SEED = 29;

/** The queue's figures are drawn a little under life size, so thirty fit on the apron. */
const FIGURE_SCALE = 0.95;

/** The parked plane, its stairs and the boarding queue: the queue is as long as the crowd right now. */
export interface Stand {
  /** Shows `count` people in the queue, the first at the foot of the stairs. */
  readonly setQueue: (count: number) => void;
  readonly dispose: Cancel;
}

/**
 * Returns the stand: the Caravelle parked by the terminal with its relief wings, the mobile stairs to its door,
 * and the boarding queue on the apron. The plane and its stairs are reserved, so no Gag lands on them.
 * @example
 * const stand = createStand(root, host, { layout, airline: text.paint.airline });
 * stand.setQueue(9);
 */
export function createStand(
  root: HTMLElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly airline: string },
): Stand {
  const { layout } = scene;
  const { parked, queue } = layout;
  const planeTop = parked.wheelsY - CARAVELLE.wheels * parked.scale;
  const door = { x: parked.x + 46 * parked.scale, y: parked.wheelsY - 46 };

  const plane = fixture(
    root,
    'parked-plane',
    svgMarkup(caravelleMarkup({ title: scene.airline, scale: parked.scale, facing: 'left', parked: true })),
  );
  plane.style.transform = `translate(${parked.x}px, ${planeTop}px)`;
  const stairs = fixture(root, 'stairs', svgMarkup(stairsMarkup(queue, door)));

  const line = document.createElement('div');
  line.dataset['part'] = 'queue';
  root.append(line);

  const random = createRandom(LOOKS_SEED);
  const looks = Array.from({ length: queue.max }, (_, index) => lookFor(random, index));
  const area: Rect = { x: queue.x + 6, y: planeTop, w: CARAVELLE.w * parked.scale, h: parked.wheelsY - planeTop + 6 };
  const release = host.reserve(area);

  return {
    setQueue(count) {
      const shown = Math.max(0, Math.min(queue.max, Math.round(count)));
      line.replaceChildren(...looks.slice(0, shown).map((look, index) => queueFigure(look, layout, index)));
    },
    dispose() {
      release();
      for (const node of [plane, stairs, line]) node.remove();
    },
  };
}

/**
 * Returns a still part of the scene appended to the root, its drawing placed by the caller.
 * @example
 * fixture(root, 'stairs', svgMarkup(stairsMarkup(layout.queue, door)));
 */
function fixture(root: HTMLElement, part: string, art: Element): HTMLElement {
  const node = document.createElement('div');
  node.className = 'aeroport-fixture';
  node.dataset['part'] = part;
  node.append(art);
  root.append(node);

  return node;
}

/**
 * Returns the figure in queue place `index`, placed by its feet: the line steps back to the left.
 * @example
 * queueFigure(personMarkup({ coat: 'var(--ink)', skin: '#e8c3a4' }), layout, 0);
 */
function queueFigure(look: string, layout: Layout, index: number): HTMLElement {
  const { queue } = layout;
  const x = queue.x - index * queue.spacing - 10 * FIGURE_SCALE;
  const y = queue.feetY + (index % 2) * 1.5 - 30 * FIGURE_SCALE;

  const node = document.createElement('div');
  node.className = 'aeroport-fixture';
  node.dataset['part'] = 'queue-person';
  node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  node.append(svgMarkup(figureSvg(look, FIGURE_SCALE, true)));

  return node;
}

/**
 * Returns the look of queue place `index`: coat, skin, a hat now and then, a roller case for some.
 * @example
 * lookFor(createRandom(29), 0).startsWith('<g'); // true
 */
function lookFor(random: Random, index: number): string {
  const coat = COATS[Math.floor(random.next() * COATS.length)] ?? COATS[0];
  const skin = SKINS[(index * 3 + Math.floor(random.next() * 2)) % SKINS.length] ?? SKINS[0];

  return personMarkup({ coat, skin, hat: random.next() < 0.25, bag: random.next() < 0.3 ? 'roller' : null });
}
