import type { Language, SourceEvent } from '@deskorama/core';
import type { SeenEvent } from '../../shared/seen-event.ts';

/**
 * Returns an Event as the settings window shows it: its words in the display language, its time and its Role.
 * @example
 * seenEvent(merged, 'en'); // { label: 'Pull request merged', detail: '#418 …', at: 1791122400000, archetype: 'approval' }
 */
export function seenEvent(event: SourceEvent, lang: Language): SeenEvent {
  const { label, detail } = event.text[lang];

  return { label, detail, at: event.at.getTime(), archetype: event.archetype };
}
