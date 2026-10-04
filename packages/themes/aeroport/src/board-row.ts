import type { WallpaperEvent } from '@deskorama/core';
import { onDrum } from './drum.ts';
import { isDescribed } from './is-described.ts';
import { shortenLabel } from './shorten-label.ts';
import type { Strings } from './strings.ts';

/** The board's flight column, in cells. */
export const FLIGHT_CELLS = 16;

/** The board's status column, in cells. */
export const STATUS_CELLS = 12;

/** One row of the Departures board: what happened, and a short status. */
export interface BoardRow {
  readonly flight: string;
  readonly status: string;
}

/**
 * Returns the board row of an Event, or null for a deploy, whose flight has its own Gag. The flight is the label
 * cut to 16 cells at a word; the status is the tag, else the rest of the label, else the airport's word for the
 * Role, cut to 12 cells at a word. An Event of a kind nobody described shows its Source and says so. Every letter
 * is on the drum.
 * @example
 * boardRow(merged, textFor('en')); // { flight: "PULL REQUEST", status: "MERGED" }
 * boardRow({ ...merged, archetype: null, recognised: false, source: 'Mail' }, textFor('en'));
 * // { flight: "MAIL", status: "UNRECOGNISED" }
 */
export function boardRow(event: WallpaperEvent, text: Strings): BoardRow | null {
  if (event.archetype === 'deploy') return null;

  if (!isDescribed(event)) {
    return { flight: onDrum(event.source).slice(0, FLIGHT_CELLS).trim(), status: text.board.unknown };
  }

  const label = onDrum(event.label).replace(/\s+/g, ' ').trim();
  const flight = shortenLabel(label, FLIGHT_CELLS, text.board);
  const tag = onDrum(event.meta.tag).trim();
  const end = label.indexOf(flight) + flight.length;
  const cutAtWord = end >= label.length || label.charAt(end) === ' ';
  const rest = cutAtWord ? label.slice(end).replace(/^[\s:;,.!?-]+/, '') : '';
  const fresh = tag !== '' && !` ${flight} `.includes(` ${tag} `) ? tag : rest;
  const status = fresh === '' ? text.board.roles[event.archetype] : fresh;

  return { flight, status: shortenLabel(status, STATUS_CELLS, text.board) };
}
