import type { Cancel } from './clock.ts';
import { createListeners } from './create-listeners.ts';
import type { GaugeMove } from './gauge-move.ts';
import type { GaugeValues } from './gauge-values.ts';

/** The Gauges of the engine, shared by every screen. */
export interface Gauges {
  readonly values: () => GaugeValues;
  /** Sets the values a Source reported; roles left out keep their value. */
  readonly set: (values: Partial<GaugeValues>) => void;
  /** Moves one Gauge because an Event implies it; a count never goes below zero. */
  readonly move: (move: GaugeMove) => void;
  /** Calls `listener` with the new values whenever one changes, until cancelled. */
  readonly onChange: (listener: (values: GaugeValues) => void) => Cancel;
}

/**
 * Returns the Gauges at zero with the build idle, until a Source reports values or an Event moves them. Listeners
 * hear only real changes.
 * @example
 * const gauges = createGauges();
 * gauges.set({ daily: 12 });
 * gauges.move({ role: 'daily', by: 3 });
 * gauges.values().daily; // 15
 */
export function createGauges(): Gauges {
  let current: GaugeValues = { crowd: 0, daily: 0, total: 0, build: 'idle' };
  const listeners = createListeners<GaugeValues>();
  const set = (values: Partial<GaugeValues>): void => {
    const next = { ...current, ...values };
    const changed =
      next.crowd !== current.crowd ||
      next.daily !== current.daily ||
      next.total !== current.total ||
      next.build !== current.build;
    if (!changed) return;
    current = next;
    listeners.emit(current);
  };
  return {
    values: () => current,
    set,
    move({ role, by }) {
      const value = Math.max(0, current[role] + by);
      set(role === 'crowd' ? { crowd: value } : role === 'daily' ? { daily: value } : { total: value });
    },
    onChange: listeners.add,
  };
}
