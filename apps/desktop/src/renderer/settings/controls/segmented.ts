import { element } from '../element.ts';

/** One segment of a segmented control. */
export interface Segment<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

/**
 * Returns a segmented control: a short row of exclusive choices, the chosen one pressed. `onChoose` receives the
 * segment clicked, unless it is already the chosen one.
 * @example
 * segmented('Time of day', [{ value: 'day', label: 'Day' }, { value: 'night', label: 'Night' }], 'day', setTime);
 */
export function segmented<Value extends string>(
  label: string,
  segments: readonly Segment<Value>[],
  chosen: Value,
  onChoose: (value: Value) => void,
): HTMLElement {
  const buttons = segments.map((segment) =>
    element('button', {
      text: segment.label,
      attributes: { type: 'button', 'aria-pressed': String(segment.value === chosen) },
      onClick: () => {
        if (segment.value !== chosen) onChoose(segment.value);
      },
    }),
  );

  return element('div', { className: 'segmented', attributes: { role: 'group', 'aria-label': label } }, buttons);
}
