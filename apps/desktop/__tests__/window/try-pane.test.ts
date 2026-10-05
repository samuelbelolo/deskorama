import { ARCHETYPES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { AEROPORT_ABOUT } from '@deskorama/theme-aeroport/about';
import { IMMEUBLE_ABOUT } from '@deskorama/theme-immeuble/about';
import { ROLE_GROUPS } from '../../src/renderer/settings/try/role-groups.ts';
import { connectedSnapshot } from './connected-snapshot.ts';
import { openWindow } from './open-window.ts';

/**
 * Opens the window on a Theme and goes to its Try pane.
 * @example
 * const { sent } = await openTry('immeuble');
 */
async function openTry(theme: 'aeroport' | 'immeuble') {
  const snapshot = connectedSnapshot('en');
  const opened = await openWindow({ ...snapshot, wallpaper: { ...snapshot.wallpaper, theme } });

  opened.root.querySelector<HTMLElement>('[data-pane="try"]')?.click();

  return opened;
}

describe('the Try pane', () => {
  test('puts the failed deploy first, with a picture of the Theme’s big scene and what plays', async () => {
    const { root, sent } = await openTry('aeroport');

    const first = root.querySelector('.pane > :nth-child(2)');

    expect(first?.querySelector('h3')?.textContent).toBe('Failed deploy');
    expect(first?.querySelector('img')?.src).toBe(AEROPORT_ABOUT.pictures.jackpot);
    expect(first?.textContent).toContain(AEROPORT_ABOUT.gags['failed-deploy'].en);

    await page.getByRole('button', { name: 'Play: Failed deploy' }).click();

    expect(sent('playTest')).toEqual([['failed-deploy']]);
    await expect.element(page.getByRole('status')).toHaveTextContent('Played on L’Aéroport: Failed deploy.');
  });

  test('groups every Role once, each with the line the Theme on the desktop provides, and plays it', async () => {
    const { root, sent } = await openTry('immeuble');

    expect(ROLE_GROUPS.flatMap((group) => group.roles).toSorted()).toEqual(ARCHETYPES.toSorted());
    expect(Array.from(root.querySelectorAll('.role-group .section-title')).map((title) => title.textContent)).toEqual([
      'People',
      'Work judged',
      'Shipping',
      'Reactions',
      'Money and intruders',
    ]);

    const lines = Array.from(root.querySelectorAll('.role-row .sub')).map((line) => line.textContent);

    expect(lines.toSorted()).toEqual(ARCHETYPES.map((role) => IMMEUBLE_ABOUT.gags[role].en).toSorted());

    await page.getByRole('button', { name: 'Play: Money' }).click();
    await page.getByRole('button', { name: 'Play: Deploy' }).click();

    expect(sent('playTest')).toEqual([['money'], ['deploy']]);
    await expect.element(page.getByRole('status')).toHaveTextContent('Played on L’Immeuble: Deploy.');
  });

  test('shows the press on the button that was clicked, which keeps the keyboard, for a moment', async () => {
    const { root, clock } = await openTry('aeroport');

    const money = root.querySelector<HTMLElement>('button[aria-label="Play: Money"]');

    await page.getByRole('button', { name: 'Play: Money' }).click();

    expect(money?.isConnected).toBe(true);
    expect(money?.classList.contains('just-played')).toBe(true);
    expect(document.activeElement).toBe(money);
    await expect.element(page.getByRole('status')).toHaveTextContent('Played on L’Aéroport: Money.');

    clock.advance(1000);

    expect(money?.classList.contains('just-played')).toBe(false);

    // What was played is still said once the pane is drawn again, here a minute later.
    clock.advance(60_000);

    await expect.element(page.getByRole('status')).toHaveTextContent('Played on L’Aéroport: Money.');
  });

  test('plays where the wallpaper is: picking the other Theme changes the Theme on the desktop', async () => {
    const { sent } = await openTry('aeroport');

    await expect
      .element(page.getByRole('button', { name: AEROPORT_ABOUT.name }))
      .toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: IMMEUBLE_ABOUT.name }).click();

    expect(sent('setPreferences')).toEqual([[{ theme: 'immeuble' }]]);
  });
});
