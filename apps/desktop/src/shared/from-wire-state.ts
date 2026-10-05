import type { SharedSnapshot } from '@deskorama/core';
import { fromWireEvent } from './from-wire-event.ts';
import type { WireState } from './wire-state.ts';

/**
 * Returns the shared state a wire state carries.
 * @example
 * fromWireState(toWireState(state)); // equal to state
 */
export function fromWireState(wire: WireState): SharedSnapshot {
  const { lastDeploy } = wire.today;

  return {
    ...wire,
    today: { ...wire.today, lastDeploy: lastDeploy === null ? null : fromWireEvent(lastDeploy) },
    recent: wire.recent.map(fromWireEvent),
  };
}
