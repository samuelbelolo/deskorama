import type { Language } from '@deskorama/core';
import type { TestAnswer } from '../../shared/settings-bridge.ts';
import { element } from './element.ts';
import { SETTINGS_TEXT } from './settings-text.ts';
import { statusLine } from './status-line.ts';

/**
 * Returns what a test found: the latest Events, newest first, that the connection worked with none yet, or what
 * the person must fix.
 * @example
 * const answer = { ok: true, events: [{ label: 'Deploy succeeded', detail: 'v2.5.0', at }] };
 * result.replaceChildren(renderTestResult(answer, 'en'));
 */
export function renderTestResult(answer: TestAnswer, lang: Language): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  if (!answer.ok) {
    return 'status' in answer
      ? statusLine(answer.status, lang)
      : element('p', { className: 'result failing', text: text.fix });
  }

  if (answer.events.length === 0) return element('p', { className: 'status ok', text: text.noEvent });

  const events = answer.events.map((event) =>
    element('div', { className: 'event' }, [
      element('div', { text: event.label }),
      element('div', { className: 'event-detail', text: event.detail }),
    ]),
  );

  return element('div', {}, [element('p', { className: 'status ok', text: text.latest }), ...events]);
}
