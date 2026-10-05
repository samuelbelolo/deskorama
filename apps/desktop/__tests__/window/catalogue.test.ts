import { LANGUAGES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { CONNECTORS } from '../../src/main/connectors.ts';
import { connectedSnapshot } from './connected-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { openWindow } from './open-window.ts';

describe('the catalogue of the settings window', () => {
  test('on first run, says what a Source is and shows the catalogue first', async () => {
    const { root } = await openWindow(emptySnapshot('en'));

    await expect.element(page.getByRole('heading', { name: 'Sources', level: 1 })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Connect a first service' })).toBeVisible();

    expect(root.querySelector('.welcome p')?.textContent).toContain(
      'A Source is a service Deskorama reads from this Mac',
    );
    expect(root.querySelector('.source-row')).toBeNull();
    expect(root.querySelector('.side-foot')?.textContent).toBe('No Source read');
  });

  test.for(LANGUAGES)('is built from the Connectors, each in its own words, in %s', async (lang) => {
    const { root } = await openWindow(emptySnapshot(lang));

    const tiles = Array.from(root.querySelectorAll('.service-tile'));

    expect(tiles.map((tile) => tile.querySelector('.service-name')?.textContent)).toEqual(
      CONNECTORS.map((connector) => connector.title[lang]),
    );
    expect(tiles.map((tile) => tile.querySelector('.service-pitch')?.textContent)).toEqual(
      CONNECTORS.map((connector) => connector.about.pitch[lang]),
    );
  });

  test('draws each Connector’s own logo on its own tile colour, from data bundled with the app', async () => {
    const { root } = await openWindow(emptySnapshot('en'));

    const drawn = Array.from(root.querySelectorAll('.service-tile .logo-tile path')).map((path) =>
      path.getAttribute('d'),
    );

    expect(drawn).toEqual(CONNECTORS.map((connector) => connector.about.logo.path));
    expect(root.querySelector('img[src^="http"], link[href^="http"], script[src^="http"]')).toBeNull();
  });

  test('keeps the catalogue under the connected Sources, to add more', async () => {
    const { root } = await openWindow(connectedSnapshot('en'));

    const titles = Array.from(root.querySelectorAll('.pane .section-title')).map((title) => title.textContent);

    expect(titles).toEqual(['Connected', 'Add a Source']);
    expect(root.querySelectorAll('.service-tile')).toHaveLength(CONNECTORS.length);
  });

  test('leads a script author from the empty catalogue to the Local webhook', async () => {
    await openWindow(emptySnapshot('en'));

    await page.getByRole('button', { name: 'Use the Local webhook' }).click();

    await expect.element(page.getByRole('heading', { name: 'Local webhook', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Previous pane' }).click();

    await expect.element(page.getByRole('heading', { name: 'Sources', level: 1 })).toBeVisible();
  });
});
