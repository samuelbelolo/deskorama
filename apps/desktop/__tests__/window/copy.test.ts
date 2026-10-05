import { LANGUAGES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { agoText } from '../../src/renderer/settings/ago-text.ts';
import { PANES } from '../../src/renderer/settings/pane-id.ts';
import { connectedSnapshot } from './connected-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { NOW } from './now.ts';
import { openWindow, type OpenWindow } from './open-window.ts';

/**
 * Returns every string a person can read or hear in the window as it is drawn: its text, and the labels, titles
 * and placeholders of its controls.
 * @example
 * wordsOf(root).join('\n'); // 'Sources\nConnect a first service\n…'
 */
function wordsOf(root: HTMLElement): string[] {
  const named = Array.from(root.querySelectorAll('[aria-label], [title], [placeholder], [alt]')).flatMap((node) =>
    ['aria-label', 'title', 'placeholder', 'alt'].map((name) => node.getAttribute(name) ?? ''),
  );

  return [root.textContent, document.title, ...named];
}

/**
 * Returns every string of every pane of an open window, then of every Connector's sheet, where the Connector's own
 * words are shown.
 * @example
 * wordsOfEveryPane(await openWindow(emptySnapshot('fr'))).length; // hundreds of strings
 */
function wordsOfEveryPane(opened: OpenWindow): string[] {
  const { root } = opened;
  const words: string[] = [];

  for (const pane of PANES) {
    root.querySelector<HTMLElement>(`[data-pane="${pane}"]`)?.click();
    words.push(...wordsOf(root));
  }

  root.querySelector<HTMLElement>('[data-pane="sources"]')?.click();

  for (const tile of root.querySelectorAll<HTMLElement>('[data-connector]')) {
    tile.click();
    words.push(...wordsOf(root));
    root.querySelector<HTMLElement>('.sheet-foot .btn:not(.primary)')?.click();
  }

  return words;
}

describe('the words of the settings window', () => {
  test.for(LANGUAGES)('never use an em dash or an en dash, in %s', async (lang) => {
    const empty = wordsOfEveryPane(await openWindow(emptySnapshot(lang)));
    const connected = wordsOfEveryPane(await openWindow(connectedSnapshot(lang)));

    const said = [...empty, ...connected].join('\n');

    expect(said).not.toMatch(/[\u2013\u2014]/);
    expect(said.length).toBeGreaterThan(5000);
  });

  test('say how long ago an Event came, keeping a number and its unit together', () => {
    const minute = 60_000;

    expect(agoText(NOW - 20_000, NOW, 'en')).toBe('just now');
    expect(agoText(NOW - 2 * minute, NOW, 'fr')).toBe('il y a 2\u00a0min');
    expect(agoText(NOW - 59 * minute, NOW, 'en')).toBe('59\u00a0min ago');
    expect(agoText(new Date(2026, 9, 4, 9, 5).getTime(), NOW, 'fr')).toBe('à 09:05');
    expect(agoText(new Date(2026, 9, 3, 18, 40).getTime(), NOW, 'fr')).toBe('hier à 18:40');
    expect(agoText(new Date(2026, 8, 28, 18, 40).getTime(), NOW, 'en')).toBe('on Sep 28');
  });
});
