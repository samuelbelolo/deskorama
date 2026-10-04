import type { Cancel, GaugeValues, ScreenHost, WallpaperEvent } from '@deskorama/core';
import { createBoard } from './create-board.ts';
import { createLounge, LOUNGE_PLACES } from './create-lounge.ts';
import { createPile } from './create-pile.ts';
import { createStand } from './create-stand.ts';
import { createTimeOfDay } from './create-time-of-day.ts';
import { createTower } from './create-tower.ts';
import { createWindsock } from './create-windsock.ts';
import { crowdFit } from './crowd-fit.ts';
import { isDescribed } from './is-described.ts';
import type { Layout } from './layout.ts';
import type { Strings } from './strings.ts';

/** The still life of the airport, which follows the hour, the Gauges and the day's Events. */
export interface Ambient {
  /** Takes note of an Event as it arrives, before its Gag plays: the board lists it, today's rejections grow the pile. */
  readonly note: (event: WallpaperEvent) => void;
  readonly dispose: Cancel;
}

/**
 * Sets up everything that stands on the poster between Gags: the hour on the sky, the tower, the windsock, the
 * parked plane with its queue, the lounge, the rejected-baggage pile and the Departures board. The crowd fills the
 * queue and the lounge and lifts the windsock; the build state moves the tower, the runway's state and its lights.
 * @example
 * const ambient = createAmbient(root, poster, host, { layout, text });
 * host.onEvent(ambient.note);
 */
export function createAmbient(
  root: HTMLElement,
  poster: SVGElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly text: Strings },
): Ambient {
  const { layout } = scene;
  const tower = createTower(root, poster, host);
  const sock = createWindsock(root, host, layout);
  const stand = createStand(root, host, { layout, airline: scene.text.paint.airline });
  const setLounge = createLounge(poster, layout);
  const pile = createPile(root, host, scene);
  const board = createBoard(root, host, scene);

  let day = new Date(host.clock.now()).toDateString();
  pile.setCount(host.today().roles.rejection ?? 0);

  const stopTime = createTimeOfDay(root, poster, { clock: host.clock, layout }, (phase) => {
    tower.setPhase(phase);
    const today = new Date(host.clock.now()).toDateString();
    if (today !== day) pile.setCount(host.today().roles.rejection ?? 0);
    day = today;
  });

  const show = (gauges: GaugeValues): void => {
    const max = host.source.gauges.crowd.max;
    stand.setQueue(crowdFit(gauges.crowd, max, layout.queue.max));
    setLounge(crowdFit(gauges.crowd, max, LOUNGE_PLACES));
    sock.set(gauges.crowd / Math.max(1, max));
    tower.setBuild(gauges.build);
    board.setRunway(gauges.build === 'building' ? 'busy' : gauges.build === 'error' ? 'closed' : 'free');
    root.classList.toggle('is-closed', gauges.build === 'error');
  };

  show(host.gauges());
  const stopGauges = host.onGauges(show);

  return {
    note(event) {
      board.push(event);
      const today = new Date(event.at).toDateString() === new Date(host.clock.now()).toDateString();
      if (isDescribed(event) && event.archetype === 'rejection' && today) pile.setCount(pile.count() + 1);
    },
    dispose() {
      stopGauges();
      stopTime();
      tower.dispose();
      sock.dispose();
      board.dispose();
      pile.dispose();
      stand.dispose();
    },
  };
}
