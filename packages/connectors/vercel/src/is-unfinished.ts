import type { ReadyState } from './ready-state.ts';

/**
 * Returns true while a deployment is still on its way: queued, initializing or building. Every other state is the
 * end of it.
 * @example
 * isUnfinished('BUILDING'); // true
 * isUnfinished('READY'); // false
 */
export function isUnfinished(state: ReadyState): boolean {
  return state === 'QUEUED' || state === 'INITIALIZING' || state === 'BUILDING';
}
