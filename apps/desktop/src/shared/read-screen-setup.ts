import type { Scene } from './scene.ts';
import type { ScreenSetup } from './screen-setup.ts';
import { AVAILABLE_THEMES } from './theme-choice.ts';

/**
 * Returns the screen setup a renderer page was opened with; throws when a parameter is missing or malformed.
 * @example
 * readScreenSetup('?screen=1&x=0&y=0&width=1728&height=1117&seed=7&scene={…}').screen.width; // 1728
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

  const screen = { id, x: number('x'), y: number('y'), width: number('width'), height: number('height') };

  return { screen, scene: readScene(query.get('scene')), seed: number('seed') };
}

/**
 * Returns the scene written as JSON in the page's query; throws when it is missing or not a scene.
 * @example
 * readScene('{"theme":"aeroport","lang":"fr","source":{"name":"Tramlo","gauges":{…}}}').lang; // "fr"
 */
function readScene(json: string | null): Scene {
  const scene: unknown = JSON.parse(json ?? 'null');

  if (!isScene(scene)) throw new Error('The renderer page lacks a valid "scene" parameter.');

  return scene;
}

/**
 * Returns true for a scene. The main process writes it, so only its shape is checked: a Theme the app ships, a
 * display language and a Source with a name; the words of its Gauges are trusted.
 * @example
 * isScene({ theme: 'aeroport', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE }); // true
 * isScene({ theme: 'tabloid', lang: 'fr', source: LOCAL_WEBHOOK_PROFILE }); // false
 */
function isScene(value: unknown): value is Scene {
  return (
    typeof value === 'object' &&
    value !== null &&
    'theme' in value &&
    AVAILABLE_THEMES.some((id) => id === value.theme) &&
    'lang' in value &&
    (value.lang === 'fr' || value.lang === 'en') &&
    'source' in value &&
    typeof value.source === 'object' &&
    value.source !== null &&
    'name' in value.source &&
    typeof value.source.name === 'string'
  );
}
