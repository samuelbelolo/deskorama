import type { IntervalBounds } from '@deskorama/core';
import { labelledInput, type LabelledInput } from './labelled-input.ts';

/** The polling interval's input, read in milliseconds. */
export interface IntervalField extends LabelledInput {
  /** The interval in milliseconds, or null when left empty for the Connector's default. */
  readonly value: () => number | null;
  /** True when what was typed is not a number, so the form marks the field without sending it. */
  readonly unreadable: () => boolean;
}

/**
 * Returns the input of a Source's polling interval, in seconds within its Connector's bounds, holding `start` (in
 * milliseconds, null for the default), with the default as its placeholder.
 * @example
 * const interval = intervalField({ min: 30_000, default: 60_000, max: 900_000 }, 120_000, text.interval);
 * interval.value(); // 120000
 */
export function intervalField(
  bounds: IntervalBounds,
  start: number | null,
  label: (min: string, max: string) => string,
): IntervalField {
  const input = labelledInput(
    'interval',
    label(seconds(bounds.min), seconds(bounds.max)),
    start === null ? '' : seconds(start),
    {
      type: 'number',
      min: seconds(bounds.min),
      max: seconds(bounds.max),
      step: '1',
      placeholder: seconds(bounds.default),
    },
  );

  const { field } = input;

  return {
    ...input,
    value: () => (Number.isNaN(field.valueAsNumber) ? null : Math.round(field.valueAsNumber * 1000)),
    unreadable: () => field.validity.badInput,
  };
}

/**
 * Returns a duration in whole seconds, as the interval field shows it.
 * @example
 * seconds(90_000); // "90"
 */
function seconds(milliseconds: number): string {
  return String(Math.round(milliseconds / 1000));
}
