import type { GaugeValues, Language, SourceInfo } from '@deskorama/core';
import { localeFor } from './locale-for.ts';
import type { Strings } from './strings.ts';

/** The strip of airfield signs, and how to write the Gauges on it. */
export interface SignBoard {
  readonly strip: HTMLElement;
  /** Writes every Gauge's value, and the deploy sign's word for the build state. */
  readonly show: (values: GaugeValues) => void;
}

/** The signs that show a number, in the order they stand. */
const COUNTED = ['crowd', 'daily', 'total'] as const;

/**
 * Returns the strip of signs: one per Gauge, labelled with the Source's own short word over the airport's word for
 * the role (its full label as a tooltip), then the deploy sign, painted orange once a deploy failed.
 * @example
 * const board = drawSigns(host.source, textFor('en'), 'en');
 * board.show({ crowd: 4, daily: 23, total: 37, build: 'idle' }); // ACTIVE / RIGHT NOW / 4 ... DEPLOY / RUNWAY 09 / CLEAR
 */
export function drawSigns(source: SourceInfo, text: Strings, lang: Language): SignBoard {
  const strip = document.createElement('div');
  strip.className = 'aeroport-signs';
  strip.dataset['part'] = 'signs';
  const values = COUNTED.map((role) => {
    const { sign, value } = drawSign(role, [source.gauges[role].short, text.signs.roles[role]]);
    sign.title = source.gauges[role].label;
    strip.append(sign);
    return { role, value };
  });
  const deploy = drawSign('build', [text.signs.deploy, text.signs.runway]);
  strip.append(deploy.sign);
  const numbers = new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 0 });
  return {
    strip,
    show(gauges) {
      for (const { role, value } of values) value.textContent = numbers.format(gauges[role]);
      deploy.value.textContent = text.signs.build[gauges.build];
      deploy.sign.classList.toggle('aeroport-sign--news', gauges.build === 'error');
    },
  };
}

/**
 * Returns one sign with its two label lines and an empty value, marked `sign-<name>` for tests.
 * @example
 * drawSign('daily', ['COMMITS', 'TODAY']).value.textContent = '23';
 */
function drawSign(name: string, lines: readonly [string, string]): { sign: HTMLElement; value: HTMLElement } {
  const sign = document.createElement('div');
  sign.className = 'aeroport-sign';
  sign.dataset['part'] = `sign-${name}`;
  for (const line of lines) {
    const label = document.createElement('span');
    label.className = 'aeroport-sign-label';
    label.textContent = line;
    sign.append(label);
  }
  const value = document.createElement('span');
  value.className = 'aeroport-sign-value';
  value.dataset['part'] = `sign-${name}-value`;
  sign.append(value);
  return { sign, value };
}
