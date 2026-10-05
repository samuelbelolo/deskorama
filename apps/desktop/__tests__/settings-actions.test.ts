import { createFeed } from '@deskorama/connector-feed';
import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import { createPostHog } from '@deskorama/connector-posthog';
import type { SourceEvent } from '@deskorama/core';
import { createFakeClock, createFakeFetch, FIXTURE_TIME, sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createWebhookControl } from '../src/main/create-webhook-control.ts';
import { createSceneControl } from '../src/main/scene/create-scene-control.ts';
import { createSettingsService } from '../src/main/settings-window/create-settings-service.ts';
import { settingsActions } from '../src/main/settings-window/settings-actions.ts';
import { createSourceRuntime } from '../src/main/sources/create-source-runtime.ts';
import { DEFAULT_PREFERENCES } from '../src/shared/preferences.ts';
import { fakeSystemAccess } from './fake-system-access.ts';
import { memoryStores } from './memory-stores.ts';

const CONNECTORS = [createPostHog(), createFeed()];

/**
 * Returns the settings window's actions over in-memory stores, a scene in French, a Local webhook that listens on
 * nothing real, and a Mac that records what was opened and copied.
 * @example
 * const { actions, opened } = await setUp();
 * actions.openTokenPage('posthog', {});
 * opened; // ['https://us.posthog.com/settings/user-api-keys']
 */
async function setUp() {
  const clock = createFakeClock(FIXTURE_TIME);
  const stores = memoryStores();
  const { fetch } = createFakeFetch(() => ({ status: 200, body: { events: [], next_cursor: null, has_more: false } }));
  const opened: string[] = [];
  const copied: string[] = [];
  const accepting: ((event: SourceEvent) => void)[] = [];

  const runtime = createSourceRuntime({
    connectors: CONNECTORS,
    clock,
    fetch,
    ...stores,
    onEvent: () => {},
    onGauges: () => {},
    onStates: () => {},
  });

  const service = createSettingsService({
    lang: () => 'fr',
    connectors: CONNECTORS,
    runtime,
    ...stores,
    clock,
    fetch,
    readSources: () => [],
    writeSources: () => {},
    newId: () => 'src-1',
  });

  const scene = createSceneControl({
    connectors: CONNECTORS,
    fallback: LOCAL_WEBHOOK_PROFILE,
    systemLanguages: ['fr-FR'],
    preferences: DEFAULT_PREFERENCES,
    sources: [],
    savePreferences: () => {},
    send: () => {},
  });

  const webhook = createWebhookControl({
    on: true,
    port: 47_213,
    secret: 'first-secret-of-the-test',
    redraw: () => 'second-secret-of-the-test',
    saveOn: () => {},
    listen: (_secret, onEvent) => {
      accepting.push(onEvent);

      return { start: async () => 47_213, stop: async () => {} };
    },
    onEvent: () => {},
    onError: () => {},
  });

  await webhook.start();

  const system = fakeSystemAccess(clock, opened, copied);

  const actions = settingsActions({ service, scene, webhook, connectors: CONNECTORS, playTest: () => {}, system });

  return { actions, opened, copied, receive: (id: string) => accepting.at(-1)?.(sourceEventFixture({ id })) };
}

describe('what the settings window asks of the main process', () => {
  test('shows the Mac’s accent colour, its own language and the Local webhook, without the secret', async () => {
    const { actions, receive } = await setUp();

    receive('a');

    const snapshot = actions.snapshot();

    expect(snapshot).toMatchObject({
      lang: 'fr',
      systemLang: 'en',
      now: FIXTURE_TIME,
      accent: '#ff9500',
      webhook: { on: true, listening: true, address: 'http://127.0.0.1:47213/events', canRegenerate: true },
    });
    expect(snapshot.webhook.recent).toHaveLength(1);
    expect(snapshot.webhook.example).toContain('$DESKORAMA_SECRET');
    expect(snapshot.connectors.map((connector) => connector.id)).toEqual(['posthog', 'feed']);
    expect(JSON.stringify(snapshot)).not.toContain('first-secret-of-the-test');
  });

  test('opens only the token page its Connector names', async () => {
    const { actions, opened } = await setUp();

    actions.openTokenPage('posthog', { host: 'https://eu.posthog.com' });
    actions.openTokenPage('feed', { url: 'https://api.tramlo.example/events' });
    actions.openTokenPage('unknown', { host: 'https://tramlo.example' });

    expect(opened).toEqual(['https://eu.posthog.com/settings/user-api-keys']);
  });

  test('copies the address, the secret, or a command that works as pasted', async () => {
    const { actions, copied } = await setUp();

    actions.copy('webhook-address');
    actions.copy('webhook-secret');
    actions.copy('webhook-example');

    expect(copied.slice(0, 2)).toEqual(['http://127.0.0.1:47213/events', 'first-secret-of-the-test']);
    expect(copied[2]).toContain("-H 'Authorization: Bearer first-secret-of-the-test'");
    expect(copied[2]).toContain('"fr": {"label": "Sauvegarde terminée"}');
  });

  test('reveals the secret on demand, and the new one once drawn again', async () => {
    const { actions } = await setUp();

    expect(actions.revealSecret()).toBe('first-secret-of-the-test');

    await actions.regenerateSecret();

    expect(actions.revealSecret()).toBe('second-secret-of-the-test');
  });

  test('turns the Local webhook off', async () => {
    const { actions } = await setUp();

    await actions.setWebhookOn(false);

    expect(actions.snapshot().webhook).toMatchObject({ on: false, listening: false });
  });
});
