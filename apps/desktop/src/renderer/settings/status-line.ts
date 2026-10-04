import type { Language } from '@deskorama/core';
import { failureText } from '../../shared/failure-text.ts';
import { shortTime } from '../../shared/short-time.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import { element } from './element.ts';
import { SETTINGS_TEXT } from './settings-text.ts';

/**
 * Returns the line that says where a Source stands: being read, read at a time, or what to fix.
 * @example
 * statusLine({ state: 'failing', failure: { kind: 'auth' }, at }, 'en');
 * // <p class="status failing">Token refused: paste a new one.</p>
 */
export function statusLine(status: SourceStatus, lang: Language): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  if (status.state === 'waiting') return element('p', { className: 'status', text: text.waiting });

  if (status.state === 'ok') {
    return element('p', { className: 'status ok', text: text.ok(shortTime(status.at, lang)) });
  }

  return element('p', { className: 'status failing', text: failureText(status.failure, lang) });
}
