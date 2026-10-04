import type { Cancel, Clock, Language, ScreenHost, WallpaperEvent } from '@deskorama/core';
import { boardRow, FLIGHT_CELLS, STATUS_CELLS, type BoardRow } from './board-row.ts';
import { createFlapField, type FlapField, type FlapTone } from './create-flap-field.ts';
import { drawBoardFrame } from './draw-board-frame.ts';
import { freshTone } from './fresh-tone.ts';
import type { Layout } from './layout.ts';
import { localeFor } from './locale-for.ts';
import type { RunwayState, Strings } from './strings.ts';

/** How many Events the board lists, newest on top. */
const BOARD_ROWS = 5;

/** How long the newest row stays bright, as live news: the life of its Gag and Caption. */
export const FRESH_MS = 7000;

/** How the time column reads: "14:02", in 24 hours in both languages. */
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };

/** Cells of the time column and of the runway state. */
const TIME_CELLS = 5;
const RUNWAY_CELLS = 8;

/** The Departures board: a log of what happened, and the runway's state. */
export interface Board {
  /**
   * Puts an Event on the top row, bright (orange for bad news); the older rows move down, dimmed. Deploys are not
   * listed.
   */
  readonly push: (event: WallpaperEvent) => void;
  readonly setRunway: (state: RunwayState) => void;
  readonly dispose: Cancel;
}

/** One listed Event, as its three fields read, and the tone it flips in while it is the newest. */
interface Listed extends BoardRow {
  readonly time: string;
  readonly tone: FlapTone;
}

/**
 * Returns the split-flap Departures board on its pylons over the hangar. It starts with the latest Events already
 * listed, dimmed, and is reserved so no Gag covers it.
 * @example
 * const board = createBoard(root, host, { layout, text });
 * board.push(event); // 14:02  PULL REQUEST  MERGED, bright for 7 s
 */
export function createBoard(
  root: HTMLElement,
  host: ScreenHost,
  scene: { readonly layout: Layout; readonly text: Strings },
): Board {
  const { layout, text } = scene;
  const { clock } = host;
  const instant = host.reducedMotion;
  const frame = drawBoardFrame(root, layout, text);

  const runway = createFlapField(RUNWAY_CELLS, clock, 'board-runway');
  frame.runway.append(runway.node);

  const rows = Array.from({ length: BOARD_ROWS }, (_, i) => createRow(frame.rows, clock, i));

  const listed = lister(host.lang, text);

  let entries = host
    .recent(40)
    .map(listed)
    .filter((entry) => entry !== null)
    .slice(0, BOARD_ROWS);
  let fresh: Cancel | null = null;

  const render = (newest: boolean, animate: boolean): void => {
    rows.forEach((fields, i) => {
      const entry = entries[i];
      const tone = i === 0 && newest && entry !== undefined ? entry.tone : 'dim';
      fields[0].flip(entry?.time ?? '', tone, !animate);
      fields[1].flip(entry?.flight ?? '', tone, !animate);
      fields[2].flip(entry?.status ?? '', tone, !animate);
    });
  };

  render(false, false);
  runway.flip(text.board.runwayState.free, 'plain', true);
  const release = host.reserve({ ...layout.board });

  return {
    push(event) {
      const entry = listed(event);
      if (entry === null) return;

      entries = [entry, ...entries].slice(0, BOARD_ROWS);
      render(true, !instant);
      fresh?.();
      fresh = clock.after(FRESH_MS, () => rows[0]?.forEach((field) => field.node.setAttribute('data-tone', 'dim')));
    },
    setRunway(state) {
      runway.flip(text.board.runwayState[state], state === 'closed' ? 'news' : 'plain', instant);
    },
    dispose() {
      fresh?.();
      release();
      runway.dispose();
      for (const fields of rows) for (const field of fields) field.dispose();
      frame.node.remove();
    },
  };
}

/**
 * Returns how an Event reads on the board, with its time in the display language and its tone while newest; null
 * for an Event the board does not list.
 * @example
 * lister('fr', textFor('fr'))(merged); // { flight: "PULL REQUEST", status: "MERGÉE", time: "16:00", tone: "fresh" }
 */
function lister(lang: Language, text: Strings): (event: WallpaperEvent) => Listed | null {
  const times = new Intl.DateTimeFormat(localeFor(lang), TIME_FORMAT);

  return (event) => {
    const row = boardRow(event, text);
    return row === null ? null : { ...row, time: times.format(event.at), tone: freshTone(event.archetype) };
  };
}

/**
 * Returns the three fields of row `index` (time, flight, status), side by side in a row appended to `parent`.
 * @example
 * const [time, flight, status] = createRow(frame.rows, host.clock, 0);
 */
function createRow(parent: HTMLElement, clock: Clock, index: number): readonly [FlapField, FlapField, FlapField] {
  const fields = [
    createFlapField(TIME_CELLS, clock, `board-row-${index}-time`),
    createFlapField(FLIGHT_CELLS, clock, `board-row-${index}-flight`),
    createFlapField(STATUS_CELLS, clock, `board-row-${index}-status`),
  ] as const;

  const row = document.createElement('div');
  row.className = 'aeroport-board-row';
  row.append(...fields.map((field) => field.node));
  parent.append(row);

  return fields;
}
