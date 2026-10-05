import type { IntervalBounds, Language } from '@deskorama/core';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/** The polling interval's field in the sheet's footer, typed in seconds. */
export interface IntervalField {
  readonly node: HTMLElement;
  readonly input: HTMLInputElement;
  /** The interval in milliseconds; null when it is left empty or on the Connector's default. */
  readonly value: () => number | null;
  /** True when what was typed is not a number, so the sheet marks the field without sending it. */
  readonly unreadable: () => boolean;
}

/**
 * Returns the field of a Source's polling interval, in seconds, showing `chosen` (in milliseconds) or the
 * Connector's default, with the bounds it must stay within written beside it.
 * @example
 * const every = intervalField({ min: 30_000, default: 60_000, max: 900_000 }, null, 'fr');
 * every.value(); // null: "60" is the default
 */
export function intervalField(bounds: IntervalBounds, chosen: number | null, lang: Language): IntervalField {
  const text = SETTINGS_TEXT[lang];

  const input = element('input', {
    className: 'field mono',
    attributes: {
      type: 'number',
      name: 'interval',
      min: String(bounds.min / 1000),
      max: String(bounds.max / 1000),
      step: '1',
      placeholder: String(bounds.default / 1000),
    },
  });

  input.value = String(Math.round((chosen ?? bounds.default) / 1000));

  const node = element('label', { className: 'interval' }, [
    element('span', { text: text.sheetEvery }),
    input,
    element('span', { text: text.seconds }),
    element('span', { className: 'muted', text: `(${text.sheetBounds(duration(bounds.min), duration(bounds.max))})` }),
  ]);

  return {
    node,
    input,
    value() {
      if (Number.isNaN(input.valueAsNumber)) return null;

      const milliseconds = Math.round(input.valueAsNumber * 1000);

      return milliseconds === bounds.default ? null : milliseconds;
    },
    unreadable: () => input.validity.badInput,
  };
}

/**
 * Returns a duration as the sheet writes a bound: seconds under two minutes, minutes above, the unit kept on the
 * same line as its number.
 * @example
 * duration(30_000); // '30\u00a0s'
 * duration(900_000); // '15\u00a0min'
 */
function duration(milliseconds: number): string {
  const seconds = milliseconds / 1000;

  return seconds < 120 ? `${seconds}\u00a0s` : `${seconds / 60}\u00a0min`;
}
