import { element } from './element.ts';
import { icon, type IconName } from './icon.ts';

/** What a status says: all is fine, the app is waiting on its own, or the person must act. */
export type StatusKind = 'ok' | 'wait' | 'bad';

/** The glyph of each kind of status; the colour comes with its class and carries the same meaning. */
const STATUS_ICONS: Readonly<Record<StatusKind, IconName>> = {
  ok: 'check-circle-fill',
  wait: 'clock-countdown-fill',
  bad: 'warning-circle-fill',
};

/**
 * Returns a status: a glyph and a sentence, coloured only for what it means.
 * @example
 * statusLine('bad', 'Token refused: paste a new one.'); // <p class="status bad">…</p>
 */
export function statusLine(kind: StatusKind, sentence: string): HTMLElement {
  return element('p', { className: `status ${kind}` }, [icon(STATUS_ICONS[kind]), element('span', { text: sentence })]);
}
