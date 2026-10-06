import { LANGUAGES, type Screen } from '@deskorama/core';
import type { Scene } from './scene.ts';
import type { ScreenSetup } from './screen-setup.ts';
import { AVAILABLE_THEMES } from './theme-choice.ts';

/**
 * Returns the screen setup a renderer page was opened with; throws when a parameter is missing or malformed.
 * @example
 * readScreenSetup('?screen=1&x=0&y=0&width=1728&height=1117&bottomInset=75&seed=7&screens=[…]&scene={…}').screen;
 * // { id: '1', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 }
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

  const frame = { id, x: number('x'), y: number('y'), width: number('width'), height: number('height') };

  return {
    screen: query.has('bottomInset') ? { ...frame, bottomInset: number('bottomInset') } : frame,
    screens: readScreens(query.get('screens')),
    scene: readScene(query.get('scene')),
    seed: number('seed'),
  };
}

/**
 * Returns the screens written as JSON in the page's query; throws when they are missing or one is not a screen.
 * @example
 * readScreens('[{"id":"1","x":0,"y":0,"width":1728,"height":1117}]').length; // 1
 */
function readScreens(json: string | null): readonly Screen[] {
  const screens: unknown = JSON.parse(json ?? 'null');

  if (!Array.isArray(screens) || !screens.every(isScreen)) {
    throw new Error('The renderer page lacks a valid "screens" parameter.');
  }

  return screens;
}

/**
 * Returns true for a screen: an id, a place and a size in numbers, and a number for the room kept at the bottom when
 * it says so.
 * @example
 * isScreen({ id: '1', x: 0, y: 0, width: 1728, height: 1117 }); // true
 * isScreen({ id: '1', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 }); // true
 * isScreen({ id: '1', x: 0, y: 0 }); // false
 */
function isScreen(value: unknown): value is Screen {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'x' in value &&
    Number.isFinite(value.x) &&
    'y' in value &&
    Number.isFinite(value.y) &&
    'width' in value &&
    Number.isFinite(value.width) &&
    'height' in value &&
    Number.isFinite(value.height) &&
    (!('bottomInset' in value) || Number.isFinite(value.bottomInset))
  );
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
    LANGUAGES.some((lang) => lang === value.lang) &&
    'source' in value &&
    typeof value.source === 'object' &&
    value.source !== null &&
    'name' in value.source &&
    typeof value.source.name === 'string'
  );
}
