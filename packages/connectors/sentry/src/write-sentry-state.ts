import type { SentryState } from './sentry-state.ts';

/**
 * Returns the cursor the platform persists for a state, which `readSentryState` reads back.
 * @example
 * writeSentryState({ since: 1791122260000, page: null, newest: 1791122260000, told: {} });
 * // '{"since":1791122260000,"page":null,"newest":1791122260000,"told":{}}'
 */
export function writeSentryState(state: SentryState): string {
  return JSON.stringify(state);
}
