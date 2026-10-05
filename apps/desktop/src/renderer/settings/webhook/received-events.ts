import type { Language } from '@deskorama/core';
import type { SeenEvent } from '../../../shared/seen-event.ts';
import { agoText } from '../ago-text.ts';
import { element } from '../element.ts';
import { roleIcon } from '../role-icon.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/**
 * Returns the latest Events the Local webhook accepted, newest first, each with its Role, its words and when it
 * came; or a line saying none came yet, so a script author knows the list is live.
 * @example
 * receivedEvents([backupDone], now, 'en'); // one row: "Backup finished", "just now"
 * receivedEvents([], now, 'en'); // "No Event received since Deskorama opened."
 */
export function receivedEvents(events: readonly SeenEvent[], now: number, lang: Language): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  if (events.length === 0) return element('p', { className: 'section-note', text: text.noneReceived });

  const rows = events.map((event) =>
    element('div', { className: 'row received-row' }, [
      roleIcon(event.archetype),
      element('div', { className: 'row-label' }, [
        element('span', { text: event.label }),
        event.detail === '' ? null : element('span', { className: 'sub', text: event.detail }),
      ]),
      element('span', { className: 'muted small', text: agoText(event.at, now, lang) }),
    ]),
  );

  return element('div', { className: 'group' }, rows);
}
