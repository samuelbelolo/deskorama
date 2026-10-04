import type { Cancel } from './clock.ts';

/** A set of listeners for one kind of value. */
export interface Listeners<Value> {
  /** Calls `listener` with every emitted value until cancelled. */
  readonly add: (listener: (value: Value) => void) => Cancel;
  /** Calls every listener with `value`. */
  readonly emit: (value: Value) => void;
  /** Forgets every listener. */
  readonly clear: () => void;
  /** How many listeners are subscribed right now. */
  readonly size: () => number;
}

/**
 * Returns an empty set of listeners. Emitting walks a snapshot, so a listener added while handling a value is not
 * called with it.
 * @example
 * const gauges = createListeners<GaugeValues>();
 * const cancel = gauges.add((values) => draw(values));
 * gauges.emit(values);
 * cancel();
 */
export function createListeners<Value>(): Listeners<Value> {
  const listeners = new Set<(value: Value) => void>();
  return {
    add(listener) {
      // A wrapper per call, so the same function added twice is two subscriptions.
      const entry = (value: Value): void => listener(value);
      listeners.add(entry);
      return () => void listeners.delete(entry);
    },
    emit(value) {
      for (const listener of Array.from(listeners)) listener(value);
    },
    clear: () => listeners.clear(),
    size: () => listeners.size,
  };
}
