import { element } from '../element.ts';

/**
 * Returns one row of a grouped form, as in System Settings: a label on the left with an optional second line under
 * it, and its controls at the end.
 * @example
 * row('Language', null, [popup('Language', languages, 'system', setLanguage)]);
 * row('“Today” Gauge', 'Payments today', [popup('“Today” Gauge', sources, 'src-2', setDaily)]);
 */
export function row(label: string, sub: string | null, end: readonly Node[]): HTMLElement {
  return element('div', { className: 'row' }, [
    element('div', { className: 'row-label' }, [
      element('span', { text: label }),
      sub === null ? null : element('span', { className: 'sub', text: sub }),
    ]),
    element('div', { className: 'row-end' }, end),
  ]);
}
