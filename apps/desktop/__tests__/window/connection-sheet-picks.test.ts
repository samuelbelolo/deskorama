import type { ConnectorOption } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { OptionsAnswer, SourceDraft } from '../../src/shared/source-draft.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { openWindow } from './open-window.ts';
import { OLD_POSTHOG, OLD_VERCEL, pickedSnapshot } from './picked-snapshot.ts';

/** The time the sheet lets the fields settle before it loads a list, and a little more. */
const SETTLED = 400;

/** The time the sheet waits before it asks again for a list the service could not be reached for. */
const RETRY = 4000;

/** The projects a fictional team's token can see. */
const PROJECTS: ConnectorOption[] = [
  { value: 'prj_api', label: 'tramlo-api' },
  { value: 'prj_docs', label: 'tramlo-docs' },
  { value: 'prj_web', label: 'tramlo-web' },
];

/** What a fictional Sentry lists: two organizations, then the projects and environments of the one chosen. */
const SENTRY_LISTS: Readonly<Record<string, ConnectorOption[]>> = {
  organization: [
    { value: 'kavelo-labs', label: 'Kavelo Labs' },
    { value: 'tramlo', label: 'Tramlo' },
  ],
  projects: [
    { value: 'tramlo-api', label: 'tramlo-api' },
    { value: 'tramlo-web', label: 'tramlo-web' },
  ],
  environments: [
    { value: 'production', label: 'production' },
    { value: 'staging', label: 'staging' },
  ],
};

const save = page.getByRole('button', { name: 'Save' });
const testButton = page.getByRole('button', { name: /^Test/ });

/**
 * Opens the sheet of one Connector from the empty catalogue, over lists answered by `listOptions`.
 * @example
 * const { root, clock, sent } = await openSheet('Vercel', () => ({ ok: true, options: PROJECTS }));
 */
async function openSheet(service: string, listOptions: (draft: SourceDraft, field: string) => OptionsAnswer) {
  const opened = await openWindow(emptySnapshot('en'), { listOptions });

  await page.getByRole('button', { name: `Connect: ${service}` }).click();

  return opened;
}

describe('the lists of the connection sheet', () => {
  test('wait for the token, load once it is pasted, and offer what it sees as checkboxes', async () => {
    const { root, clock, sent } = await openSheet('Vercel', () => ({ ok: true, options: PROJECTS }));

    expect(Array.from(root.querySelectorAll('.step-title')).map((title) => title.textContent)).toEqual([
      'Create the token',
      'Tick these permissions, read-only',
      'Paste the token',
      'Choose what to follow',
      'Test',
    ]);
    await expect.element(page.getByText('Paste the token to load the list.')).toBeVisible();
    expect(sent('listOptions')).toEqual([]);

    await page.getByLabelText('Display name').fill('Tramlo');
    await page.getByLabelText('Token').fill('vercel_fictional_0001');

    await expect.element(page.getByText('Loading the list…')).toBeVisible();

    clock.advance(SETTLED);

    await expect.element(page.getByRole('checkbox', { name: 'tramlo-web' })).toBeVisible();
    expect(sent('listOptions')).toMatchObject([[{ connector: 'vercel', token: 'vercel_fictional_0001' }, 'projects']]);
    await expect.element(page.getByText('Tick at least one.')).toBeVisible();
    expect(root.querySelectorAll('.step.done')).toHaveLength(3);

    await page.getByRole('checkbox', { name: 'tramlo-web' }).click();
    await page.getByRole('checkbox', { name: 'tramlo-api' }).click();

    await expect.element(page.getByText('2 projects', { exact: true })).toBeVisible();
    expect(root.querySelectorAll('.step.done')).toHaveLength(4);

    await testButton.click();
    await save.click();

    await expect
      .poll(() => sent('save'))
      .toMatchObject([[{ values: {}, lists: { projects: ['prj_api', 'prj_web'] } }]]);
  });

  test('asks for a new test once another project is ticked', async () => {
    const { clock } = await openSheet('Vercel', () => ({ ok: true, options: PROJECTS }));

    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);
    await page.getByRole('checkbox', { name: 'tramlo-web' }).click();
    await testButton.click();

    await expect.element(save).toBeEnabled();

    await page.getByRole('checkbox', { name: 'tramlo-docs' }).click();

    await expect.element(save).toBeDisabled();
  });

  test('name the permission the token lacks when they cannot load, and let the value be typed by hand', async () => {
    const refused: OptionsAnswer = { ok: false, failure: { kind: 'permission', permission: 'Team scope' } };

    const { clock, sent } = await openSheet('Vercel', () => refused);

    await page.getByLabelText('Display name').fill('Tramlo');
    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);

    await expect.element(page.getByText('The token lacks the “Team\u00a0scope” permission.')).toBeVisible();

    await page.getByLabelText('Vercel projects').fill('prj_web, prj_api');
    await testButton.click();
    await save.click();

    await expect.poll(() => sent('save')).toMatchObject([[{ lists: { projects: ['prj_web', 'prj_api'] } }]]);
  });

  test('say so when the token sees nothing to list, and let the value be typed by hand', async () => {
    const { clock } = await openSheet('Vercel', () => ({ ok: true, options: [] }));

    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);

    await expect.element(page.getByText('The token sees nothing to list. Type it by hand:')).toBeVisible();
    await expect.element(page.getByLabelText('Vercel projects')).toHaveAttribute('placeholder', 'tramlo-web');
  });

  test('marks a list the main process refuses', async () => {
    const { root, clock } = await openWindow(emptySnapshot('en'), {
      listOptions: () => ({ ok: true, options: PROJECTS }),
      test: () => ({ ok: false, problems: ['projects'] }),
    });

    await page.getByRole('button', { name: 'Connect: Vercel' }).click();
    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);
    await testButton.click();

    await expect.element(page.getByText('Fix the fields in red.')).toBeVisible();
    expect(root.querySelector('[data-pick="projects"]')?.getAttribute('data-invalid')).toBe('true');
  });

  test('load the lists that depend on a choice once it is made, and read none ticked as all', async () => {
    const { root, clock, sent } = await openSheet('Sentry', (_, field) => ({
      ok: true,
      options: SENTRY_LISTS[field] ?? [],
    }));

    await page.getByLabelText('Display name').fill('Tramlo errors');
    await page.getByLabelText('Token').fill('sntryu_fictional_0001');
    clock.advance(SETTLED);

    await expect.element(page.getByText('Fill in “Organization” first.').first()).toBeVisible();
    expect(sent('listOptions').map(([, field]) => field)).toEqual(['organization']);

    await page.getByLabelText('Organization', { exact: true }).selectOptions('Tramlo');
    clock.advance(SETTLED);

    await expect.element(page.getByRole('checkbox', { name: 'production' })).toBeVisible();
    expect(sent('listOptions').slice(1)).toMatchObject([
      [{ values: { organization: 'tramlo' } }, 'projects'],
      [{ values: { organization: 'tramlo' } }, 'environments'],
    ]);
    expect(Array.from(root.querySelectorAll('.pick-count')).map((count) => count.textContent)).toEqual(['All', 'All']);

    await page.getByRole('checkbox', { name: 'production' }).click();
    await testButton.click();
    await save.click();

    await expect
      .poll(() => sent('save'))
      .toMatchObject([[{ values: { organization: 'tramlo' }, lists: { projects: [], environments: ['production'] } }]]);
  });

  test('forget what was ticked under another organization', async () => {
    const { clock, sent } = await openSheet('Sentry', (_, field) => ({ ok: true, options: SENTRY_LISTS[field] ?? [] }));

    await page.getByLabelText('Token').fill('sntryu_fictional_0001');
    clock.advance(SETTLED);
    await page.getByLabelText('Organization', { exact: true }).selectOptions('Tramlo');
    clock.advance(SETTLED);
    await page.getByRole('checkbox', { name: 'tramlo-web' }).click();

    await page.getByLabelText('Organization', { exact: true }).selectOptions('Kavelo Labs');
    clock.advance(SETTLED);
    await expect.element(page.getByRole('checkbox', { name: 'tramlo-web' })).not.toBeChecked();
    await testButton.click();

    await expect.poll(() => sent('test').at(-1)).toMatchObject([{ lists: { projects: [], environments: [] } }]);
  });

  test('take a value typed under a loaded list that lacks it', async () => {
    const names = [{ value: '$pageview', label: '$pageview' }];

    const { root, clock, sent } = await openSheet('PostHog', () => ({ ok: true, options: names }));

    await page.getByLabelText('Display name').fill('Kavelo');
    await page.getByLabelText('Project ID').fill('12345');
    await page.getByLabelText('Token').fill('phx_fictional_0001');
    clock.advance(SETTLED);

    await expect.element(page.getByRole('checkbox', { name: '$pageview' })).toBeVisible();
    expect(root.querySelectorAll('.step.done')).toHaveLength(3);

    await page.getByLabelText('Not listed: Sign-up events').fill('user_signed_up');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByRole('checkbox', { name: 'user_signed_up' })).toBeChecked();
    await expect.element(page.getByLabelText('Not listed: Sign-up events')).toHaveFocus();
    expect(root.querySelectorAll('.step.done')).toHaveLength(4);

    await testButton.click();

    await expect.poll(() => sent('test')).toMatchObject([[{ lists: { signupEvents: ['user_signed_up'] } }]]);
  });

  test('ask again by themselves once the service can be reached, and keep what was typed meanwhile', async () => {
    let reachable = false;

    const { clock, sent } = await openSheet('Vercel', () =>
      reachable ? { ok: true, options: PROJECTS } : { ok: false, failure: { kind: 'network' } },
    );

    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);

    await expect.element(page.getByText('Unreachable, trying again soon.')).toBeVisible();

    await page.getByLabelText('Vercel projects').fill('prj_docs');
    clock.advance(RETRY);

    // The same failure draws nothing again: the field being typed in is still there, with what it holds.
    await expect.poll(() => sent('listOptions')).toHaveLength(2);
    await expect.element(page.getByLabelText('Vercel projects')).toHaveValue('prj_docs');
    await expect.element(page.getByLabelText('Vercel projects')).toHaveFocus();

    reachable = true;
    clock.advance(2 * RETRY);

    await expect.element(page.getByRole('checkbox', { name: 'tramlo-docs' })).toBeChecked();
    expect(sent('listOptions')).toHaveLength(3);
  });

  test('count the step as done only while a field holds no more than its limit', async () => {
    const refused: OptionsAnswer = { ok: false, failure: { kind: 'permission', permission: 'Team scope' } };
    const ids = Array.from({ length: 21 }, (_, index) => `prj_${index}`);

    const { root, clock } = await openSheet('Vercel', () => refused);

    await page.getByLabelText('Token').fill('vercel_fictional_0001');
    clock.advance(SETTLED);

    await page.getByLabelText('Vercel projects').fill(ids.join(', '));

    expect(root.querySelectorAll('.step.done')).toHaveLength(3);

    await page.getByLabelText('Vercel projects').fill(ids.slice(0, 20).join(', '));

    expect(root.querySelectorAll('.step.done')).toHaveLength(4);
  });

  test('ask the lists that depend on a typed value again once its list words it, and keep what they hold', async () => {
    const unreachable: OptionsAnswer = { ok: false, failure: { kind: 'network' } };
    const unreadable: OptionsAnswer = { ok: false, failure: { kind: 'invalid-response' } };
    let reachable = false;

    const { clock, sent } = await openSheet('Sentry', (_, field) => {
      if (!reachable) return field === 'organization' ? unreachable : unreadable;

      return { ok: true, options: SENTRY_LISTS[field] ?? [] };
    });

    await page.getByLabelText('Token').fill('sntryu_fictional_0001');
    clock.advance(SETTLED);

    await page.getByLabelText('Organization').fill('Tramlo');
    clock.advance(SETTLED);

    await page.getByLabelText('Projects').fill('tramlo-web');

    reachable = true;
    clock.advance(RETRY);

    await expect.element(page.getByLabelText('Organization', { exact: true })).toHaveValue('tramlo');

    clock.advance(SETTLED);

    await expect.element(page.getByRole('checkbox', { name: 'tramlo-web' })).toBeChecked();
    expect(sent('listOptions').slice(-2)).toMatchObject([
      [{ values: { organization: 'tramlo' } }, 'projects'],
      [{ values: { organization: 'tramlo' } }, 'environments'],
    ]);
  });

  test('offer the PostHog cloud as a choice, with an address to type for a self-hosted one', async () => {
    const { sent } = await openSheet('PostHog', () => ({ ok: true, options: [] }));

    const cloud = page.getByLabelText('PostHog cloud');

    await expect.element(cloud).toHaveValue('https://us.posthog.com');
    await expect.element(page.getByText('The number after /project/ in PostHog’s address.')).toBeVisible();

    await cloud.selectOptions('EU Cloud');
    await page.getByRole('button', { name: 'Open PostHog' }).click();

    expect(sent('openTokenPage')).toMatchObject([['posthog', { host: 'https://eu.posthog.com' }]]);

    await cloud.selectOptions('Self-hosted');
    await page.getByLabelText('Self-hosted').fill('https://posthog.kavelo.example');
    await page.getByLabelText('Token').fill('phx_fictional_0001');

    await expect.element(page.getByText('Fill in “Project ID” first.')).toBeVisible();

    await page.getByRole('button', { name: /^Test/ }).click();

    await expect.poll(() => sent('test')).toMatchObject([[{ values: { host: 'https://posthog.kavelo.example' } }]]);
  });
});

describe('a Source saved before lists existed', () => {
  test('opens with its one typed project picked in the list, kept from then on as the list words it', async () => {
    const { clock, sent } = await openWindow(pickedSnapshot('en'), {
      listOptions: () => ({ ok: true, options: PROJECTS }),
    });

    await page.getByRole('button', { name: 'Sources' }).click();
    await page.getByRole('button', { name: 'Edit…' }).nth(2).click();
    clock.advance(SETTLED);

    await expect.element(page.getByRole('checkbox', { name: 'tramlo-web' })).toBeChecked();
    await expect.element(page.getByRole('checkbox', { name: 'tramlo-api' })).not.toBeChecked();
    expect(sent('listOptions')).toMatchObject([[{ id: OLD_VERCEL.id, token: '' }, 'projects']]);

    await testButton.click();

    await expect
      .poll(() => sent('test'))
      .toMatchObject([[{ id: OLD_VERCEL.id, values: {}, lists: { projects: ['prj_web'] } }]]);
  });

  test('opens on its cloud and its one sign-up event, which stays ticked though the list no longer has it', async () => {
    const names = [{ value: 'team_created', label: 'team_created' }];

    const { clock, sent } = await openWindow(pickedSnapshot('en'), {
      listOptions: () => ({ ok: true, options: names }),
    });

    await page.getByRole('button', { name: 'Sources' }).click();
    await page.getByRole('button', { name: 'Edit…' }).nth(3).click();
    clock.advance(SETTLED);

    await expect.element(page.getByLabelText('PostHog cloud')).toHaveValue('https://eu.posthog.com');
    await expect.element(page.getByLabelText('Project ID')).toHaveValue('12345');
    await expect.element(page.getByRole('checkbox', { name: 'user_signed_up' })).toBeChecked();

    await page.getByRole('checkbox', { name: 'team_created' }).click();
    await testButton.click();

    await expect
      .poll(() => sent('test'))
      .toMatchObject([
        [
          {
            id: OLD_POSTHOG.id,
            values: { host: 'https://eu.posthog.com', project: '12345' },
            lists: { signupEvents: ['user_signed_up', 'team_created'] },
          },
        ],
      ]);
  });
});
