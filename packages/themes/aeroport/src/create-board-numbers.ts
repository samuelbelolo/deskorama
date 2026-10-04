import type { Cancel, Clock, GaugeValues, Language, SourceInfo } from '@deskorama/core';
import { createFlapField } from './create-flap-field.ts';
import { fitNumber } from './fit-number.ts';
import type { Strings } from './strings.ts';

/** The Gauges the Arrivals board counts, in the order they stand, with the cells each number flips in. */
const COUNTED = [
  ['crowd', 4],
  ['daily', 5],
  ['total', 6],
] as const;

/** The Gauges' numbers in the Arrivals board's header, where the airfield shows them in place of the signs. */
export interface BoardNumbers {
  /** Flips every number to its new value, at once when `instant`. */
  readonly show: (values: GaugeValues, instant: boolean) => void;
  readonly dispose: Cancel;
}

/**
 * Fills the Arrivals board's numbers band: for each Gauge, the Source's own short word over the airport's word for
 * the role (the Source's full label as a tooltip), then its value in split-flap digits, right-aligned and written
 * compactly when it would not fit.
 * @example
 * const numbers = createBoardNumbers(frame.numbers, host, text);
 * numbers.show(host.gauges(), true); // ACTIFS / EN CE MOMENT / 4 ...
 */
export function createBoardNumbers(
  band: HTMLElement,
  host: { readonly clock: Clock; readonly lang: Language; readonly source: SourceInfo },
  text: Strings,
): BoardNumbers {
  const fields = COUNTED.map(([role, cells]) => {
    const column = document.createElement('div');
    column.className = 'aeroport-board-number';
    column.title = host.source.gauges[role].label;

    for (const line of [host.source.gauges[role].short, text.signs.roles[role]]) {
      const label = document.createElement('span');
      label.className = 'aeroport-board-number-label';
      label.textContent = line;
      column.append(label);
    }

    const field = createFlapField(cells, host.clock, `board-${role}`);
    column.append(field.node);
    band.append(column);

    return { role, cells, field };
  });

  return {
    show(values, instant) {
      // Numbers stand right-aligned, as on a Solari number module.
      for (const { role, cells, field } of fields) {
        field.flip(fitNumber(values[role], cells, host.lang).padStart(cells), 'plain', instant);
      }
    },
    dispose: () => {
      for (const { field } of fields) field.dispose();
    },
  };
}
