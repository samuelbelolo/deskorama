import type { SharedSnapshot } from '@deskorama/core';
import { toWireEvent } from './to-wire-event.ts';
import type { WireState } from './wire-state.ts';

/**
 * Returns what every screen shares in its wire form, ready to cross to a wallpaper page.
 * @example
 * toWireState(engine.state()).recent[0]?.at; // 1791122400000
 */
export function toWireState(state: SharedSnapshot): WireState {
  const { lastDeploy } = state.today;

  return {
    ...state,
    today: { ...state.today, lastDeploy: lastDeploy === null ? null : toWireEvent(lastDeploy) },
    recent: state.recent.map(toWireEvent),
  };
}
