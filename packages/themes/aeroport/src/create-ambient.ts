import type { Cancel, GaugeValues, ScreenHost, WallpaperEvent } from '@deskorama/core';
import { createAirfieldFixtures } from './create-airfield-fixtures.ts';
import { createBoard, type Board } from './create-board.ts';
import { createTerminalFixtures } from './create-terminal-fixtures.ts';
import { createTimeOfDay } from './create-time-of-day.ts';
import { createWindsock } from './create-windsock.ts';
import type { Layout } from './layout.ts';
import type { Strings } from './strings.ts';

/** The still life of the airport, which follows the hour, the Gauges and the day's Events. */
export interface Ambient {
  /** Takes note of an Event as it arrives, before its Gag plays: the board lists it, today's rejections grow the pile. */
  readonly note: (event: WallpaperEvent) => void;
  /** The board, which the failed deploy's signature line may take over. */
  readonly board: Board;
  readonly dispose: Cancel;
}

/**
 * Sets up everything that stands on the poster between Gags: the hour on the sky, the windsock, the board, and the
 * fixtures of this side of the airport (the tower, the parked plane with its queue, the lounge and the pile by the
 * terminal; the cargo plane on the airfield). The crowd fills the queue and the lounge and lifts the windsock; the
 * build state moves the tower, the runway's state and its lights; on the airfield the board shows the Gauges.
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
  const sock = createWindsock(root, host, layout);
  const fixtures =
    layout.side === 'terminal'
      ? createTerminalFixtures(root, poster, host, scene)
      : createAirfieldFixtures(root, host, scene);
  const board = createBoard(root, host, scene);

  let day = new Date(host.clock.now()).toDateString();

  const stopTime = createTimeOfDay(root, poster, { clock: host.clock, layout }, (phase) => {
    fixtures.setPhase(phase);

    const today = new Date(host.clock.now()).toDateString();
    if (today !== day) fixtures.newDay();
    day = today;
  });

  const show = (gauges: GaugeValues): void => {
    fixtures.show(gauges);
    sock.set(gauges.crowd / Math.max(1, host.source.gauges.crowd.max));
    board.setNumbers(gauges);
    board.setRunway(gauges.build === 'building' ? 'busy' : gauges.build === 'error' ? 'closed' : 'free');
    root.classList.toggle('is-closed', gauges.build === 'error');
  };

  show(host.gauges());
  const stopGauges = host.onGauges(show);

  return {
    note(event) {
      board.push(event);
      fixtures.note(event);
    },
    board,
    dispose() {
      stopGauges();
      stopTime();
      sock.dispose();
      board.dispose();
      fixtures.dispose();
    },
  };
}
