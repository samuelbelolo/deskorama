import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { connectedSnapshot } from './connected-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { openWindow } from './open-window.ts';
import { OLD_POSTHOG, pickedSnapshot } from './picked-snapshot.ts';

/**
 * Returns the lines of one connected Source's row, as a person reads them.
 * @example
 * rowOf(root, 'src-tramlo').name; // 'Tramlo'
 */
function rowOf(root: HTMLElement, id: string) {
  const row = root.querySelector(`[data-source="${id}"]`);

  return {
    name: row?.querySelector('.source-name')?.textContent,
    where: row?.querySelector('.source-where')?.textContent,
    status: row?.querySelector('.status')?.textContent,
    last: row?.querySelector('.source-last')?.textContent,
    tinted: row?.classList.contains('bad'),
  };
}

describe('the connected Sources', () => {
  test('opens on them when one needs the person, each with its service, where it stands and its last Event', async () => {
    const { root } = await openWindow(connectedSnapshot('en'));

    await expect.element(page.getByRole('heading', { name: 'Sources', level: 1 })).toBeVisible();

    expect(rowOf(root, 'src-tramlo')).toEqual({
      name: 'Tramlo',
      where: 'Private GitHub repository, tramlo/tramlo-app',
      status: expect.stringMatching(/^Read at 02:21/),
      last: 'Last Event: Pull request merged, 2\u00a0min ago',
      tinted: false,
    });
    expect(rowOf(root, 'src-kit')).toMatchObject({
      where: 'Public GitHub repository, tramlo/tramlo-kit',
      status: expect.stringMatching(/^Rate limited, resuming at 02:32/),
      last: 'Last Event: New star on the repository, 9\u00a0min ago',
      tinted: false,
    });
    expect(root.querySelector('.side-foot')?.textContent).toBe('3 Sources read from this Mac');
  });

  test.each([
    [
      'en',
      'Vercel, 3 projects',
      'Sentry, tramlo, 2 projects, 1 environment',
      'Vercel, 1 project',
      'PostHog, EU Cloud, 1 sign-up event',
    ],
    [
      'fr',
      'Vercel, 3 projets',
      'Sentry, tramlo, 2 projets, 1 environnement',
      'Vercel, 1 projet',
      'PostHog, Cloud EU, 1 événement d’inscription',
    ],
  ] as const)(
    'says in %s how many projects or events a Source follows, one saved before lists included',
    async (lang, ...where) => {
      const { root } = await openWindow(pickedSnapshot(lang));

      await page.getByRole('button', { name: 'Sources' }).click();

      const ids = ['src-vercel', 'src-sentry', 'src-vercel-old', 'src-posthog-old'];

      expect(ids.map((id) => rowOf(root, id).where)).toEqual(where);
    },
  );

  test('names the cloud of a Source whose address was saved with a slash at its end', async () => {
    const slashed = { ...OLD_POSTHOG, values: { ...OLD_POSTHOG.values, host: 'https://eu.posthog.com/' } };
    const { root } = await openWindow({ ...pickedSnapshot('en'), sources: [slashed] });

    await page.getByRole('button', { name: 'Sources' }).click();

    expect(rowOf(root, OLD_POSTHOG.id).where).toBe('PostHog, EU Cloud, 1 sign-up event');
  });

  test('tints the Source only the person can fix, counts it in the sidebar and offers its fix', async () => {
    const { root, sent } = await openWindow(connectedSnapshot('fr'));

    expect(rowOf(root, 'src-kavelo')).toEqual({
      name: 'Kavelo',
      where: 'Stripe, Clé restreinte',
      status: 'Il manque la permission «\u00a0Subscriptions:\u00a0Read\u00a0» au jeton.',
      last: expect.stringMatching(/^Dernier événement\u00a0: Paiement reçu, hier à 18:40$/),
      tinted: true,
    });
    expect(root.querySelector('[data-pane="sources"] .badge')?.textContent).toBe('1');

    await page.getByRole('button', { name: 'Corriger le jeton' }).click();

    await expect.element(page.getByRole('dialog', { name: 'Stripe' })).toBeVisible();
    await expect.element(page.getByLabelText('Nom affiché')).toHaveValue('Kavelo');

    await page.getByLabelText('Jeton').fill('rk_fictional_0002');
    await page.getByRole('button', { name: 'Tester' }).click();

    await expect.poll(() => sent('test')).toMatchObject([[{ id: 'src-kavelo', token: 'rk_fictional_0002' }]]);
  });

  test('offers a new token to a Source whose token was refused', async () => {
    const snapshot = connectedSnapshot('en');
    const [tramlo, ...others] = snapshot.sources;

    if (tramlo === undefined) throw new Error('The snapshot lacks its first Source.');

    const refused = { ...tramlo, status: { state: 'failing', failure: { kind: 'auth' }, at: snapshot.now } as const };
    const { root } = await openWindow({ ...snapshot, sources: [refused, ...others] });

    expect(rowOf(root, 'src-tramlo')).toMatchObject({ status: 'Token refused: paste a new one.', tinted: true });
    expect(root.querySelector('[data-pane="sources"] .badge')?.textContent).toBe('2');
    await expect.element(page.getByRole('button', { name: 'Paste a new token' })).toBeVisible();
  });

  test('removes a Source only from its menu, and only once confirmed', async () => {
    const { root, sent, change } = await openWindow(connectedSnapshot('en'));

    expect(root.querySelector('.menu:not([hidden])')).toBeNull();

    await page.getByRole('button', { name: 'More actions for Tramlo Kit' }).click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();

    await expect.element(page.getByRole('alertdialog', { name: 'Remove Tramlo Kit?' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(sent('remove')).toEqual([]);
    expect(root.querySelector('.sheet')).toBeNull();

    await page.getByRole('button', { name: 'More actions for Tramlo Kit' }).click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();

    await expect.poll(() => sent('remove')).toEqual([['src-kit']]);

    // The main process then says what is left, as it does after every change.
    const left = connectedSnapshot('en');

    change({ ...left, sources: left.sources.filter((source) => source.id !== 'src-kit') });

    expect(root.querySelector('[data-source="src-kit"]')).toBeNull();
    expect(root.querySelector('.side-foot')?.textContent).toBe('2 Sources read from this Mac');
  });

  test('closes an open menu on a click elsewhere', async () => {
    const { root } = await openWindow(connectedSnapshot('en'));

    await page.getByRole('button', { name: 'More actions for Tramlo', exact: true }).click();

    expect(root.querySelectorAll('.menu:not([hidden])')).toHaveLength(1);

    await page.getByRole('heading', { name: 'Connected' }).click();

    expect(root.querySelector('.menu:not([hidden])')).toBeNull();
  });

  test('keeps one menu open at a time, and closes it on Escape with the keyboard back on its button', async () => {
    const { root } = await openWindow(connectedSnapshot('en'));

    const open = (): (string | null | undefined)[] =>
      Array.from(root.querySelectorAll('.menu:not([hidden])')).map((menu) =>
        menu.previousElementSibling?.getAttribute('aria-label'),
      );

    await page.getByRole('button', { name: 'More actions for Tramlo', exact: true }).click();
    await page.getByRole('button', { name: 'More actions for Kavelo' }).click();

    expect(open()).toEqual(['More actions for Kavelo']);
    await expect
      .element(page.getByRole('button', { name: 'More actions for Tramlo', exact: true }))
      .toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{Escape}');

    expect(open()).toEqual([]);
    await expect.element(page.getByRole('button', { name: 'More actions for Kavelo' })).toHaveFocus();
  });

  test('leaves an open menu alone when the main process reports a change, and draws it once the menu closes', async () => {
    const { root, change } = await openWindow(connectedSnapshot('en'));
    const left = connectedSnapshot('en');

    await page.getByRole('button', { name: 'More actions for Tramlo', exact: true }).click();

    change({ ...left, sources: left.sources.filter((source) => source.id !== 'src-kit') });

    expect(root.querySelectorAll('.menu:not([hidden])')).toHaveLength(1);
    expect(root.querySelectorAll('.source-row')).toHaveLength(3);

    await page.getByRole('heading', { name: 'Connected' }).click();

    expect(root.querySelector('.menu:not([hidden])')).toBeNull();
    expect(root.querySelectorAll('.source-row')).toHaveLength(2);
  });

  test('follows the Sources as the main process reports them', async () => {
    const { root, change } = await openWindow(emptySnapshot('en'));

    expect(root.querySelector('.source-row')).toBeNull();

    change(connectedSnapshot('en'));

    expect(root.querySelectorAll('.source-row')).toHaveLength(3);
    expect(root.querySelector('.welcome')).toBeNull();
  });
});
