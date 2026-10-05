import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { TestAnswer } from '../../src/shared/source-draft.ts';
import { connectedSnapshot } from './connected-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { NOW } from './now.ts';
import { openWindow } from './open-window.ts';

/** A test that found the three latest Events of a fictional repository, newest first. */
const FOUND: TestAnswer = {
  ok: true,
  gauges: {},
  events: [
    {
      label: 'Pull request merged',
      detail: '#418 Add PDF export for invoices',
      at: NOW - 300_000,
      archetype: 'approval',
    },
    { label: 'Review approved', detail: '#421 Retry failed webhooks', at: NOW - 840_000, archetype: 'like' },
    { label: 'Commits pushed to main', detail: '3 commits on main', at: NOW - 1_860_000, archetype: 'usage' },
  ],
};

const save = page.getByRole('button', { name: 'Save' });
const testButton = page.getByRole('button', { name: /^Test/ });

/**
 * Opens the GitHub sheet from the empty catalogue and fills in a fictional repository and token.
 * @example
 * const { sent } = await fillGithub({ test: () => FOUND });
 */
async function fillGithub(answers: Parameters<typeof openWindow>[1] = {}) {
  const opened = await openWindow(emptySnapshot('en'), answers);

  await page.getByRole('button', { name: 'Connect: Private GitHub repository' }).click();
  await page.getByLabelText('Display name').fill('Tramlo');
  await page.getByLabelText('Repository (owner/name)').fill('tramlo/tramlo-app');
  await page.getByLabelText('Token').fill('github_pat_fictional_0001');

  return opened;
}

describe('the connection sheet', () => {
  test('guides the connection in four steps, with the Connector’s own fields, permissions and token page', async () => {
    const { root, sent } = await openWindow(emptySnapshot('en'));

    await page.getByRole('button', { name: 'Connect: Private GitHub repository' }).click();

    await expect.element(page.getByRole('dialog', { name: 'Private GitHub repository' })).toBeVisible();

    expect(Array.from(root.querySelectorAll('.step-title')).map((title) => title.textContent)).toEqual([
      'Create the token',
      'Tick these permissions, read-only',
      'Paste the token',
      'Test',
    ]);
    expect(Array.from(root.querySelectorAll('.permissions code')).map((name) => name.textContent)).toEqual([
      'Metadata: read',
      'Contents: read',
      'Pull requests: read',
      'Issues: read',
      'Actions: read',
      'Deployments: read',
    ]);
    expect(root.querySelector('.sheet')?.textContent).toContain('choose “Only select repositories”');

    await page.getByLabelText('Repository (owner/name)').fill('tramlo/tramlo-app');
    await page.getByRole('button', { name: 'Open GitHub' }).click();

    expect(sent('openTokenPage')).toEqual([['github', { repository: 'tramlo/tramlo-app' }]]);
  });

  test('checks the steps as the token is pasted, and keeps the window behind out of reach', async () => {
    const { root } = await openWindow(emptySnapshot('en'));

    await page.getByRole('button', { name: 'Connect: Private GitHub repository' }).click();

    expect(root.querySelectorAll('.step.done')).toHaveLength(0);
    await expect.element(testButton).toBeDisabled();
    expect(root.querySelector<HTMLElement>('.sidebar')?.inert).toBe(true);

    await page.getByLabelText('Token').fill('github_pat_fictional_0001');

    expect(root.querySelectorAll('.step.done')).toHaveLength(3);
    await expect.element(testButton).toBeEnabled();
  });

  test('saves only after a test passed for what the fields hold, and stores nothing before', async () => {
    const { root, sent } = await fillGithub({ test: () => FOUND });

    await expect.element(save).toBeDisabled();

    await testButton.click();

    await expect.element(page.getByText('tramlo/tramlo-app answered, here are its 3 latest Events.')).toBeVisible();
    expect(Array.from(root.querySelectorAll('.found-meta')).map((meta) => meta.textContent?.split(', ')[1])).toEqual([
      'plays as Approval',
      'plays as Like',
      'plays as Usage',
    ]);
    expect(root.querySelectorAll('.step.done')).toHaveLength(4);
    expect(sent('save')).toEqual([]);

    // Another repository is another Source: the test no longer vouches for it.
    await page.getByLabelText('Repository (owner/name)').fill('tramlo/tramlo-kit');
    await expect.element(save).toBeDisabled();
    expect(root.querySelector('.found')).toBeNull();

    await testButton.click();
    await expect.element(save).toBeEnabled();
    await save.click();

    const draft = {
      id: null,
      connector: 'github',
      name: 'Tramlo',
      values: { repository: 'tramlo/tramlo-kit' },
      token: 'github_pat_fictional_0001',
      interval: null,
    };

    await expect.poll(() => sent('save')).toEqual([[draft]]);
    await expect.poll(() => root.querySelector('.sheet')).toBeNull();
    expect(sent('load')).toHaveLength(2);
  });

  test('keeps Save off when the service refuses the token, and says why in the app’s own words', async () => {
    const refused: TestAnswer = {
      ok: false,
      problems: [],
      status: { state: 'failing', failure: { kind: 'auth' }, at: NOW },
    };

    await fillGithub({ test: () => refused });
    await testButton.click();

    await expect.element(page.getByText('Token refused: paste a new one.')).toBeVisible();
    await expect.element(save).toBeDisabled();
  });

  test('forgets a passing test as soon as it is run again: one that then fails leaves Save off', async () => {
    const refused: TestAnswer = {
      ok: false,
      problems: [],
      status: { state: 'failing', failure: { kind: 'auth' }, at: NOW },
    };

    let tests = 0;
    const { root } = await fillGithub({ test: () => (tests++ === 0 ? FOUND : refused) });

    await testButton.click();

    await expect.element(save).toBeEnabled();
    expect(root.querySelectorAll('.step.done')).toHaveLength(4);

    await page.getByRole('button', { name: 'Test again' }).click();

    await expect.element(page.getByText('Token refused: paste a new one.')).toBeVisible();
    await expect.element(save).toBeDisabled();
    expect(root.querySelectorAll('.step.done')).toHaveLength(3);
    expect(root.querySelector('.found')).toBeNull();
  });

  test('says it did not work, with no field marked, when the Connector is gone', async () => {
    const { root } = await fillGithub({ test: () => ({ ok: false, gone: 'connector' }) });

    await testButton.click();

    await expect.element(page.getByText('That did not work: try again.')).toBeVisible();
    expect(root.querySelector('.sheet [aria-invalid="true"]')).toBeNull();
    await expect.element(save).toBeDisabled();
  });

  test('marks the fields the main process refuses', async () => {
    const { root } = await fillGithub({ test: () => ({ ok: false, problems: ['repository'] }) });

    await testButton.click();

    await expect.element(page.getByText('Fix the fields in red.')).toBeVisible();
    expect(root.querySelector('input[name="repository"]')?.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('input[name="name"]')?.getAttribute('aria-invalid')).toBe('false');
  });

  test('shows the Gauge values a Source that reports Gauges only read, under its Connector’s words', async () => {
    const { root } = await openWindow(emptySnapshot('en'), {
      test: () => ({ ok: true, events: [], gauges: { crowd: 14, daily: 37 } }),
    });

    await page.getByRole('button', { name: 'Connect: PostHog' }).click();
    await page.getByLabelText('Display name').fill('Kavelo');
    await page.getByLabelText('Token').fill('phx_fictional_0001');
    await testButton.click();

    await expect.element(page.getByText('Kavelo answered, here is what it counts.')).toBeVisible();
    expect(Array.from(root.querySelectorAll('.counted')).map((row) => row.textContent)).toEqual([
      'People active14',
      'Sign-ups today37',
    ]);
  });

  test('offers the polling interval within the Connector’s bounds, and sends one the person chose', async () => {
    const { sent } = await fillGithub({ test: () => FOUND });

    const every = page.getByLabelText(/Read every/);

    await expect.element(every).toHaveValue(60);
    await expect.element(every).toHaveAttribute('min', '30');
    await expect.element(every).toHaveAttribute('max', '900');
    await expect.element(page.getByText('(30 s to 15 min)')).toBeVisible();

    await every.fill('120');
    await testButton.click();
    await save.click();

    await expect.poll(() => sent('save')).toMatchObject([[{ interval: 120_000 }]]);
  });

  test('edits a connected Source with its token kept, and closes on Escape without saving', async () => {
    const { root, sent } = await openWindow(connectedSnapshot('en'));

    await page.getByRole('button', { name: 'Edit…' }).first().click();

    await expect.element(page.getByLabelText('Display name')).toHaveValue('Tramlo');
    await expect
      .element(page.getByLabelText('Token'))
      .toHaveAttribute('placeholder', 'Empty to keep the current token');
    expect(root.querySelectorAll('.step.done')).toHaveLength(3);

    await testButton.click();
    await expect.poll(() => sent('test')).toMatchObject([[{ id: 'src-tramlo', token: '' }]]);

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => root.querySelector('.sheet')).toBeNull();
    expect(sent('save')).toEqual([]);
    expect(root.querySelector<HTMLElement>('.sidebar')?.inert).toBe(false);
  });

  test('closes on Escape even after a click on a part of the sheet that cannot take the keyboard', async () => {
    const { root } = await openWindow(emptySnapshot('en'));

    await page.getByRole('button', { name: 'Connect: Private GitHub repository' }).click();
    await page.getByRole('heading', { name: 'Private GitHub repository' }).click();

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => root.querySelector('.sheet')).toBeNull();
  });

  test('draws what changed behind it only once closed, and gives the keyboard back to the button that opened it', async () => {
    const snapshot = connectedSnapshot('en');
    const { root, change } = await openWindow(snapshot);

    await page.getByRole('button', { name: 'Edit…' }).first().click();

    change({ ...snapshot, sources: snapshot.sources.filter((source) => source.id !== 'src-kit') });

    expect(root.querySelectorAll('.source-row')).toHaveLength(3);

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => root.querySelectorAll('.source-row')).toHaveLength(2);
    await expect.element(page.getByRole('button', { name: 'Edit…' }).first()).toHaveFocus();
  });
});
