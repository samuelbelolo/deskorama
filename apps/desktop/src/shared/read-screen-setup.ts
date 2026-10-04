import type { ScreenSetup } from './screen-setup.ts';

/**
 * Returns the screen setup a renderer page was opened with; throws when a parameter is missing or not a number.
 * @example
 * readScreenSetup('?screen=1&x=0&y=0&width=1728&height=1117&lang=fr&seed=7').screen.width; // 1728
 */
export function readScreenSetup(search: string): ScreenSetup {
  const query = new URLSearchParams(search);
  const number = (name: string): number => {
    const value = Number(query.get(name) ?? Number.NaN);
    if (!Number.isFinite(value)) throw new Error(`The renderer page lacks a numeric "${name}" parameter.`);
    return value;
  };
  const id = query.get('screen');
  if (id === null || id === '') throw new Error('The renderer page lacks its "screen" parameter.');
  const lang = query.get('lang') === 'fr' ? 'fr' : 'en';
  const screen = { id, x: number('x'), y: number('y'), width: number('width'), height: number('height') };
  return { screen, lang, seed: number('seed') };
}
