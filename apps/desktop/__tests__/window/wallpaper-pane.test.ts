import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { AEROPORT_ABOUT } from '@deskorama/theme-aeroport/about';
import { IMMEUBLE_ABOUT } from '@deskorama/theme-immeuble/about';
import { connectedSnapshot } from './connected-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import type { FakeAnswers } from './fake-bridge.ts';
import { openWindow } from './open-window.ts';

/**
 * Opens the window on three fictional Sources and goes to its Wallpaper pane.
 * @example
 * const { sent } = await openWallpaper('en');
 */
async function openWallpaper(lang: 'fr' | 'en', answers: FakeAnswers = {}) {
  const opened = await openWindow(connectedSnapshot(lang), answers);

  opened.root.querySelector<HTMLElement>('[data-pane="wallpaper"]')?.click();

  return opened;
}

describe('the Wallpaper pane', () => {
  test('shows the Theme on the desktop large, in its own words, with real pictures by day and by night', async () => {
    const { root } = await openWallpaper('en');

    const picture = (): string | undefined => root.querySelector<HTMLImageElement>('.theme-preview img')?.src;

    await expect.element(page.getByRole('heading', { name: AEROPORT_ABOUT.name })).toBeVisible();
    expect(root.querySelector('.theme-about')?.textContent).toContain(AEROPORT_ABOUT.pitch.en);
    expect(picture()).toBe(AEROPORT_ABOUT.pictures.day);

    await page.getByRole('button', { name: 'Night' }).click();

    expect(picture()).toBe(AEROPORT_ABOUT.pictures.night);
    await expect.element(page.getByRole('button', { name: 'Night' })).toHaveAttribute('aria-pressed', 'true');

    const loaded = Array.from(root.querySelectorAll<HTMLImageElement>('.pane img')).map((image) => image.decode());

    await expect(Promise.all(loaded)).resolves.toBeDefined();
  });

  test('keeps the keyboard on the control just used, though the pane is drawn again', async () => {
    await openWallpaper('en');

    const night = page.getByRole('button', { name: 'Night' });

    night.element().focus();
    await userEvent.keyboard(' ');

    await expect.element(night).toHaveAttribute('aria-pressed', 'true');
    await expect.element(night).toHaveFocus();
  });

  test('offers every Theme as a thumbnail, and draws the one chosen at once', async () => {
    const { sent } = await openWallpaper('en');

    await expect.element(page.getByRole('radio', { name: AEROPORT_ABOUT.name })).toBeChecked();

    await page.getByRole('radio', { name: IMMEUBLE_ABOUT.name }).click();

    expect(sent('setPreferences')).toEqual([[{ theme: 'immeuble' }]]);
  });

  test('picks the language, the Mac’s own first and named, and opens at login', async () => {
    const { sent } = await openWallpaper('fr');

    const language = page.getByRole('combobox', { name: 'Langue' });

    await expect.element(language).toHaveDisplayValue('Celle du Mac (Français)');

    await language.selectOptions('English');
    await page.getByRole('switch', { name: 'Ouvrir Deskorama à l’ouverture de session' }).click();

    expect(sent('setPreferences')).toEqual([[{ language: 'en' }]]);
    expect(sent('setOpenAtLogin')).toEqual([[false]]);
  });

  test('says when macOS still waits for the person to allow opening at login', async () => {
    const snapshot = connectedSnapshot('en');
    const off = { ...snapshot, wallpaper: { ...snapshot.wallpaper, login: { on: false, needsApproval: false } } };

    const { root } = await openWindow(off, { setOpenAtLogin: (on) => ({ on, needsApproval: true }) });

    root.querySelector<HTMLElement>('[data-pane="wallpaper"]')?.click();

    const login = page.getByRole('switch', { name: 'Open Deskorama at login' });

    await login.click();

    await expect
      .element(page.getByText('macOS waits for your approval in System Settings › General › Login Items.'))
      .toBeVisible();
    await expect.element(login).toBeChecked();
  });

  test('shows what macOS answers about opening at login, not what was clicked', async () => {
    const { sent } = await openWallpaper('en', { setOpenAtLogin: (on) => ({ on: !on, needsApproval: false }) });

    const login = page.getByRole('switch', { name: 'Open Deskorama at login' });

    await expect.element(login).toBeChecked();

    await login.click();

    // macOS kept the login item: the switch the click turned off is drawn on again.
    await expect.poll(() => sent('setOpenAtLogin')).toEqual([[false]]);
    await expect.element(login).toBeChecked();
  });

  test('with two Sources or more, picks the one naming the scene and the one behind each Gauge, with what it counts', async () => {
    const { root, sent } = await openWallpaper('en');

    const counted = Array.from(root.querySelectorAll('.pane .row .sub')).map((line) => line.textContent);

    expect(counted).toEqual(['Contributors active in the last hour', 'Payments today', 'Open issues']);

    await expect.element(page.getByRole('combobox', { name: 'Name on the scene' })).toHaveDisplayValue('Tramlo');
    await expect.element(page.getByRole('combobox', { name: '“Today” Gauge' })).toHaveDisplayValue('Kavelo');

    await page.getByRole('combobox', { name: '“In total” Gauge' }).selectOptions('Tramlo Kit');
    await page.getByRole('combobox', { name: '“Today” Gauge' }).selectOptions('Same as the scene (Tramlo)');

    expect(sent('setPreferences')).toEqual([[{ gauges: { total: 'src-kit' } }], [{ gauges: { daily: null } }]]);
  });

  test('leaves the scene’s choices out with fewer than two Sources', async () => {
    const snapshot = emptySnapshot('en');
    const [only] = connectedSnapshot('en').sources;

    if (only === undefined) throw new Error('The snapshot lacks its first Source.');

    const { root } = await openWindow({ ...snapshot, sources: [only] });

    await expect.element(page.getByRole('heading', { name: 'Wallpaper', level: 1 })).toBeVisible();
    expect(Array.from(root.querySelectorAll('.pane .section-title')).map((title) => title.textContent)).toEqual([
      'Theme',
      'General',
    ]);
  });
});
