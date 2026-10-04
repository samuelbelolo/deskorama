import type { ScreenHost } from '@deskorama/core';
import { createLounge, LOUNGE_PLACES } from './create-lounge.ts';
import { createPile } from './create-pile.ts';
import { createStand } from './create-stand.ts';
import { createTower } from './create-tower.ts';
import { crowdFit } from './crowd-fit.ts';
import { isDescribed } from './is-described.ts';
import type { Layout } from './layout.ts';
import type { SideFixtures } from './side-fixtures.ts';
import type { Strings } from './strings.ts';

/**
 * Returns what stands on the terminal side: the tower, whose controller follows the build state and the hour; the
 * parked plane with its boarding queue and the lounge, as long as the crowd; and the rejected-baggage pile, which
 * counts today's rejections.
 * @example
 * const fixtures = createTerminalFixtures(root, poster, host, { layout, text });
 * fixtures.show(host.gauges());
 */
export function createTerminalFixtures(
  root: HTMLElement,
  poster: SVGElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly text: Strings },
): SideFixtures {
  const { layout } = scene;
  const tower = createTower(root, poster, host);
  const stand = createStand(root, host, { layout, airline: scene.text.paint.airline });
  const setLounge = createLounge(poster, layout);
  const pile = createPile(root, host, scene);

  const countToday = (): void => pile.setCount(host.today().roles.rejection ?? 0);
  countToday();

  return {
    setPhase: tower.setPhase,
    show(gauges) {
      const max = host.source.gauges.crowd.max;
      stand.setQueue(crowdFit(gauges.crowd, max, layout.queue.max));
      setLounge(crowdFit(gauges.crowd, max, LOUNGE_PLACES));
      tower.setBuild(gauges.build);
    },
    note(event) {
      const today = new Date(event.at).toDateString() === new Date(host.clock.now()).toDateString();
      if (isDescribed(event) && event.archetype === 'rejection' && today) pile.setCount(pile.count() + 1);
    },
    newDay: countToday,
    dispose() {
      tower.dispose();
      pile.dispose();
      stand.dispose();
    },
  };
}
