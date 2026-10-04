import type { Archetype, SourceEvent } from '@deskorama/core';
import { TEST_EVENT_TEXT } from './test-event-text.ts';

/** The name test Events carry as their Source. */
export const TEST_SOURCE = 'Test';

/**
 * Returns a test Event of one Role other than deploy, with words in every language and a unique id so it is never
 * dropped as a replay. It moves no Gauge.
 * @example
 * testEvent('money', 'test-money-1', new Date(1791122400000)).text.en.label; // "Payment received"
 */
export function testEvent(role: Exclude<Archetype, 'deploy'>, id: string, at: Date): SourceEvent {
  return {
    id,
    kind: `test.${role}`,
    archetype: role,
    recognised: true,
    source: TEST_SOURCE,
    at,
    ...TEST_EVENT_TEXT[role],
  };
}
