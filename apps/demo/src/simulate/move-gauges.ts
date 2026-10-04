import type { GaugeMove } from '@deskorama/core';
import type { GaugeState } from './gauge-state.ts';

/**
 * Returns the simulated Gauges after an Event moved one of them, exactly as the engine moves its own: by the move,
 * never below zero.
 * @example
 * moveGauges({ crowd: 4, daily: 25, total: 37 }, { role: 'daily', by: 3 }); // { crowd: 4, daily: 28, total: 37 }
 */
export function moveGauges(state: GaugeState, { role, by }: GaugeMove): GaugeState {
  return { ...state, [role]: Math.max(0, state[role] + by) };
}
