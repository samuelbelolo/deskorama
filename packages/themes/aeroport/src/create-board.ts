import type { Cancel, Clock, GaugeValues, Language, Rect, ScreenHost, WallpaperEvent } from '@deskorama/core';
import { boardRow, FLIGHT_CELLS, STATUS_CELLS, type BoardRow } from './board-row.ts';
import { createBoardNumbers } from './create-board-numbers.ts';
import { createFlapField, type FlapField, type FlapTone } from './create-flap-field.ts';
import { drawBoardFrame } from './draw-board-frame.ts';
import { freshTone } from './fresh-tone.ts';
import type { Layout } from './layout.ts';
import { localeFor } from './locale-for.ts';
import type { RunwayState, Strings } from './strings.ts';
import { takeOverRows } from './take-over-rows.ts';

/** How many Events the board lists, newest on top. */
const BOARD_ROWS = 5;

/** How long the newest row stays bright, as live news: the life of its Gag and Caption. */
export const FRESH_MS = 7000;

/** How the time column reads: "14:02", in 24 hours in both languages. */
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };

/** Cells of the time column and of the runway state. */
const TIME_CELLS = 5;
const RUNWAY_CELLS = 8;

/** The board: a log of what happened, the runway's state, and on the airfield the Gauges' numbers. */
export interface Board {
  /**
   * Puts an Event on the top row, bright (orange for bad news); the older rows move down, dimmed. Deploys are not
   * listed.
   */
  readonly push: (event: WallpaperEvent) => void;
  readonly setRunway: (state: RunwayState) => void;
  /** Flips the Gauges' numbers on the Arrivals board; the Departures board has none. */
  readonly setNumbers: (values: GaugeValues) => void;
  /** Where the first row stands, in screen pixels, so a Gag can tell whether the board shows. */
  readonly firstRow: () => Rect;
  /** Lays two full-width lines over the first two rows until the returned function hands them back. */
  readonly takeOver: (lines: readonly [string, string]) => Cancel;
  readonly dispose: Cancel;
}

/** One listed Event, as its three fields read, and the tone it flips in while it is the newest. */
interface Listed extends BoardRow {
  readonly time: string;
  readonly tone: FlapTone;
}

/**
 * Returns the split-flap board on its pylons over the hangar: Departures on the terminal side, Arrivals with the
 * Gauges' numbers on the airfield. It starts with the latest Events already listed, dimmed, and is reserved so no
 * Gag covers it.
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
  const numbers = frame.numbers === null ? null : createBoardNumbers(frame.numbers, host, text);

  const rows = Array.from({ length: BOARD_ROWS }, (_, i) => createRow(frame.rows, clock, i));

  const listed = lister(host.lang, text);

  let entries = host
    .recent(40)
    .map(listed)
    .filter((entry) => entry !== null)
    .slice(0, BOARD_ROWS);
  let fresh: Cancel | null = null;
  let counted = false;

  const render = (newest: boolean, animate: boolean): void => renderRows(rows, entries, { newest, animate });

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
    setNumbers(values) {
      // The first numbers land at once, like the rows; later ones flip.
      numbers?.show(values, instant || !counted);
      counted = true;
    },
    firstRow: () => firstRowOf(layout.board, frame.rows),
    takeOver: (lines) => takeOverRows(frame.rows, clock, lines, instant || host.isHidden()),
    dispose() {
      fresh?.();
      release();
      runway.dispose();
      numbers?.dispose();
      for (const fields of rows) for (const field of fields) field.dispose();
      frame.node.remove();
    },
  };
}

/**
 * Flips every row to its listed Event, or blank: the newest bright in its tone when `newest`, the others dimmed;
 * at once unless `animate`.
 * @example
 * renderRows(rows, entries, { newest: true, animate: true });
 */
function renderRows(
  rows: readonly (readonly [FlapField, FlapField, FlapField])[],
  entries: readonly Listed[],
  how: { readonly newest: boolean; readonly animate: boolean },
): void {
  rows.forEach((fields, i) => {
    const entry = entries[i];
    const tone = i === 0 && how.newest && entry !== undefined ? entry.tone : 'dim';

    fields[0].flip(entry?.time ?? '', tone, !how.animate);
    fields[1].flip(entry?.flight ?? '', tone, !how.animate);
    fields[2].flip(entry?.status ?? '', tone, !how.animate);
  });
}

/**
 * Returns where the board's first row stands, in screen pixels, so a scene can tell whether it shows.
 * @example
 * firstRowOf(layout.board, frame.rows); // { x: 878, y: 90, w: 432, h: 30 }
 */
function firstRowOf(board: Rect, rows: HTMLElement): Rect {
  return { x: board.x + rows.offsetLeft, y: board.y + rows.offsetTop, w: board.w - 2 * rows.offsetLeft, h: 30 };
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
