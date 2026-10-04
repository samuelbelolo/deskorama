import type { Cancel, GaugeValues } from '@deskorama/core';

/** Gauges a test sets by hand, with their listeners. */
export interface FakeGauges {
  readonly gauges: () => GaugeValues;
  readonly onGauges: (listener: (gauges: GaugeValues) => void) => Cancel;
  /** Sets some Gauges; every listener hears the new values. */
  readonly setGauges: (values: Partial<GaugeValues>) => void;
}

/**
 * Returns Gauges at zero with the build idle, which move only when a test sets them.
 * @example
 * const gauges = createFakeGauges();
 * gauges.setGauges({ daily: 23, build: 'building' });
 * gauges.gauges().daily; // 23
 */
export function createFakeGauges(): FakeGauges {
  const listeners = new Set<(gauges: GaugeValues) => void>();
  let current: GaugeValues = { crowd: 0, daily: 0, total: 0, build: 'idle' };
  return {
    gauges: () => current,
    onGauges(listener) {
      const entry = (values: GaugeValues): void => listener(values);
      listeners.add(entry);
      return () => void listeners.delete(entry);
    },
    setGauges(values) {
      current = { ...current, ...values };
      for (const listener of Array.from(listeners)) listener(current);
    },
  };
}
