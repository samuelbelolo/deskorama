import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { connectedSnapshot } from './connected-snapshot.ts';
import type { FakeAnswers } from './fake-bridge.ts';
import { NOW } from './now.ts';
import { openWindow } from './open-window.ts';

/**
 * Opens the window and goes to its Local webhook pane, with part of the webhook's state changed.
 * @example
 * const { sent } = await openWebhook({ listening: false });
 */
async function openWebhook(
  change: Partial<ReturnType<typeof connectedSnapshot>['webhook']> = {},
  answers: FakeAnswers = {},
) {
  const snapshot = connectedSnapshot('en');
  const opened = await openWindow({ ...snapshot, webhook: { ...snapshot.webhook, ...change } }, answers);

  opened.root.querySelector<HTMLElement>('[data-pane="webhook"]')?.click();

  return opened;
}

describe('the Local webhook pane', () => {
  test('turns the Local webhook off and on', async () => {
    const { sent } = await openWebhook();

    const toggle = page.getByRole('switch', { name: 'Turn on the Local webhook' });

    await expect.element(toggle).toBeChecked();
    await expect.element(page.getByText('Listens on 127.0.0.1 and ::1, never on the network.')).toBeVisible();

    await toggle.click();

    expect(sent('setWebhookOn')).toEqual([[false]]);
  });

  test('says when another app holds its port', async () => {
    await openWebhook({ listening: false });

    await expect
      .element(
        page.getByText('http://127.0.0.1:47213/events is taken by another app: the Local webhook is not listening.'),
      )
      .toBeVisible();
  });

  test('shows the loopback address, and the secret only once asked; both are copied by the main process', async () => {
    const { root, sent } = await openWebhook();

    const codes = (): (string | null)[] =>
      Array.from(root.querySelectorAll('.copy-field code')).map((code) => code.textContent);

    expect(codes()).toEqual(['http://127.0.0.1:47213/events', '•'.repeat(22)]);
    expect(root.textContent).not.toContain('f3a9-fictional-secret-0001');

    await page.getByRole('button', { name: 'Show the secret' }).click();

    await expect.poll(codes).toEqual(['http://127.0.0.1:47213/events', 'f3a9-fictional-secret-0001']);

    await page.getByRole('button', { name: 'Hide the secret' }).click();

    expect(codes()[1]).toBe('•'.repeat(22));

    for (const button of root.querySelectorAll<HTMLElement>('.pane button[title="Copy"]')) button.click();

    expect(sent('copy')).toEqual([['webhook-address'], ['webhook-secret'], ['webhook-example']]);
  });

  test('gives a one-line curl that names the secret without showing it', async () => {
    const { root } = await openWebhook();

    const example = root.querySelector('.terminal code')?.textContent ?? '';

    expect(example).toMatch(/^curl http:\/\/127\.0\.0\.1:47213\/events -H "Authorization: Bearer \$DESKORAMA_SECRET"/);
    expect(example).not.toContain('\n');
  });

  test('draws a new secret only once confirmed, and masks the one that was shown', async () => {
    const { root, sent } = await openWebhook();

    await page.getByRole('button', { name: 'Show the secret' }).click();
    await page.getByRole('button', { name: 'Regenerate…' }).click();

    await expect.element(page.getByRole('alertdialog', { name: 'Regenerate the secret?' })).toBeVisible();
    expect(sent('regenerateSecret')).toEqual([]);

    await page.getByRole('button', { name: 'Regenerate', exact: true }).click();

    await expect.poll(() => sent('regenerateSecret')).toEqual([[]]);
    await expect.poll(() => root.querySelector('.copy-field .secret')?.textContent).toBe('•'.repeat(22));
  });

  test('says when the new secret could not be drawn, until the person leaves the pane', async () => {
    const { root, sent } = await openWebhook(
      {},
      {
        regenerateSecret: () => {
          throw new Error('The Keychain refused the new secret.');
        },
      },
    );

    await page.getByRole('button', { name: 'Regenerate…' }).click();
    await page.getByRole('button', { name: 'Regenerate', exact: true }).click();

    await expect.poll(() => sent('regenerateSecret')).toEqual([[]]);
    await expect.element(page.getByText('The secret was not regenerated: the old one still works.')).toBeVisible();

    root.querySelector<HTMLElement>('[data-pane="sources"]')?.click();
    root.querySelector<HTMLElement>('[data-pane="webhook"]')?.click();

    expect(root.textContent).not.toContain('The secret was not regenerated');
  });

  test('offers no new secret when the secret comes from outside the app', async () => {
    const { root } = await openWebhook({ canRegenerate: false });

    expect(root.querySelector('.section-head .btn')).toBeNull();
  });

  test('lists the latest Events received, or says none came yet', async () => {
    const { root } = await openWebhook();

    expect(root.querySelector('.received-row')?.textContent).toBe('Backup finished4\u00a0min ago');

    await openWebhook({ recent: [] });

    await expect.element(page.getByText('No Event received since Deskorama opened.')).toBeVisible();
  });

  test('says how long ago an Event came as time goes by, without waiting for the main process', async () => {
    const { root, clock } = await openWebhook({
      recent: [{ label: 'Backup finished', detail: '', at: NOW - 20_000, archetype: 'approval' }],
    });

    expect(root.querySelector('.received-row')?.textContent).toBe('Backup finishedjust now');

    clock.advance(60_000);

    expect(root.querySelector('.received-row')?.textContent).toBe('Backup finished1\u00a0min ago');
  });
});
