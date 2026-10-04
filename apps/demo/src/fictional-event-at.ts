import type { SourceEvent } from '@deskorama/core';
import { FICTIONAL_EVENTS } from './fictional-events.ts';

/**
 * Returns the `count`-th Event the demo sends: the fictional Events in turn, each with its own id and the time it
 * is sent at.
 * @example
 * fictionalEventAt(0, Date.UTC(2026, 9, 4, 14)).id; // "demo-0-pull_request.merged"
 * fictionalEventAt(8, Date.UTC(2026, 9, 4, 14)).kind; // "pull_request.merged", the list starts again
 */
export function fictionalEventAt(count: number, now: number): SourceEvent {
  const event = FICTIONAL_EVENTS[count % FICTIONAL_EVENTS.length];
  if (event === undefined) throw new Error('The demo has no fictional Event to send.');
  return { ...event, id: `demo-${count}-${event.kind}`, at: new Date(now) };
}
