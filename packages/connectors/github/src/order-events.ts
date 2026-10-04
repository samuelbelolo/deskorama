import type { SourceEvent } from '@deskorama/core';

/**
 * Returns the Events oldest first, each id once: a run read both in the list and by id is one Event.
 * @example
 * orderEvents([merged, opened, merged]); // [opened, merged]
 */
export function orderEvents(events: readonly SourceEvent[]): SourceEvent[] {
  const unique = new Map(events.map((event) => [event.id, event]));

  return [...unique.values()].toSorted((a, b) => a.at.getTime() - b.at.getTime());
}
