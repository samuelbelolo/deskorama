import type { SourceEvent } from '@deskorama/core';
import { createFakeClock, FIXTURE_TIME } from '@deskorama/test-utils';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { afterEach, describe, expect, test } from 'vitest';
import { createLocalWebhook, type LocalWebhook } from '../src/create-local-webhook.ts';
import { post } from './post.ts';

const SECRET = 'tramlo-ci-local-secret';

/** A deploy of Tramlo, a fictional product, as a CI script on the Mac would post it. */
const DEPLOY = {
  id: 'tramlo-deploy-2026-10-04-1',
  kind: 'deploy.finished',
  archetype: 'deploy',
  rarity: 'notable',
  source: 'Tramlo CI',
  at: '2026-10-04T13:58:00Z',
  step: 'succeeded',
  gauge: { role: 'daily', by: 1 },
  text: {
    fr: { label: 'Déploiement réussi', detail: 'v2.5.0 en production', tag: 'v2.5.0' },
    en: { label: 'Deploy succeeded', detail: 'v2.5.0 in production', tag: 'v2.5.0' },
  },
};

let webhook: LocalWebhook | undefined;

afterEach(async () => {
  await webhook?.stop();
  webhook = undefined;
});

/**
 * Starts a Local webhook on a free port with a fake Clock and returns its port and the Events it accepted.
 * @example
 * const { port, received } = await startWebhook();
 */
async function startWebhook(): Promise<{ port: number; received: SourceEvent[] }> {
  const received: SourceEvent[] = [];
  webhook = createLocalWebhook({
    port: 0,
    secret: SECRET,
    clock: createFakeClock(FIXTURE_TIME),
    onEvent: (event) => received.push(event),
  });
  return { port: await webhook.start(), received };
}

/**
 * Returns the first IPv4 address of this machine that is not the loopback interface, if it has one.
 * @example
 * networkAddress(); // "192.168.1.20"
 */
function networkAddress(): string | undefined {
  const addresses = Object.values(networkInterfaces()).flatMap((list) => list ?? []);
  return addresses.find((address) => address.family === 'IPv4' && !address.internal)?.address;
}

describe('the Local webhook', () => {
  test('accepts an Event carrying the secret and hands it on as posted', async () => {
    const { port, received } = await startWebhook();
    const answer = await post(port, JSON.stringify(DEPLOY), { secret: SECRET });
    expect(answer).toEqual({ status: 202, body: { accepted: DEPLOY.id } });
    expect(received).toEqual([
      {
        id: DEPLOY.id,
        kind: 'deploy.finished',
        archetype: 'deploy',
        recognised: true,
        rarity: 'notable',
        source: 'Tramlo CI',
        at: new Date(Date.UTC(2026, 9, 4, 13, 58)),
        text: DEPLOY.text,
        step: 'succeeded',
        gauge: { role: 'daily', by: 1 },
      },
    ]);
  });

  test('fills in what a short post leaves out: the time, an id, the other language, the generic Role', async () => {
    const { port, received } = await startWebhook();
    const minimal = { kind: 'backup.done', source: 'Backup', text: { en: { label: 'Backup finished' } } };
    expect((await post(port, JSON.stringify(minimal), { secret: SECRET })).status).toBe(202);
    const event = received[0];
    expect(event?.at.getTime()).toBe(FIXTURE_TIME);
    expect(event?.id).toMatch(/^local-/);
    expect(event?.archetype).toBeNull();
    expect(event?.rarity).toBe('common');
    expect(event?.text.fr).toEqual({ label: 'Backup finished', detail: '', tag: '' });
  });

  test('gives two Events posted without an id two different ids', async () => {
    const { port, received } = await startWebhook();
    const minimal = JSON.stringify({ kind: 'backup.done', source: 'Backup', text: { fr: { label: 'Sauvegarde' } } });
    await post(port, minimal, { secret: SECRET });
    await post(port, minimal, { secret: SECRET });
    expect(new Set(received.map((event) => event.id)).size).toBe(2);
  });

  test('listens on the IPv6 loopback address too', async () => {
    const { port, received } = await startWebhook();
    expect((await post(port, JSON.stringify(DEPLOY), { secret: SECRET, address: '::1' })).status).toBe(202);
    expect(received).toHaveLength(1);
  });

  test.skipIf(networkAddress() === undefined)('is not reachable from the network', async () => {
    const { port } = await startWebhook();
    await expect(
      post(port, JSON.stringify(DEPLOY), { secret: SECRET, address: networkAddress() ?? '' }),
    ).rejects.toThrow(/ECONNREFUSED/);
  });

  test.each([
    ['a missing secret', { secret: null }, 401],
    ['a wrong secret', { secret: 'tramlo-ci-local-secreT' }, 401],
    ['a foreign Host, as a rebound web page sends', { secret: SECRET, host: 'tramlo.example' }, 403],
    ['another path', { secret: SECRET, path: '/' }, 404],
    ['another method', { secret: SECRET, method: 'PUT' }, 405],
    ['a body that is not declared as JSON', { secret: SECRET, contentType: 'text/plain' }, 415],
  ])('refuses %s, and plays nothing', async (_, options, status) => {
    const { port, received } = await startWebhook();
    expect((await post(port, JSON.stringify(DEPLOY), options)).status).toBe(status);
    expect(received).toEqual([]);
  });

  test('refuses a body that is not JSON', async () => {
    const { port, received } = await startWebhook();
    expect(await post(port, '{"kind":', { secret: SECRET })).toEqual({
      status: 400,
      body: { error: 'The body is not valid JSON.' },
    });
    expect(received).toEqual([]);
  });

  test('refuses an invalid Event and names each field at fault', async () => {
    const { port, received } = await startWebhook();
    const invalid = { ...DEPLOY, archetype: 'party', text: {}, lable: 'typo' };
    const answer = await post(port, JSON.stringify(invalid), { secret: SECRET });
    expect(answer.status).toBe(422);
    const issues = answer.body['issues'];
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^archetype: /),
        expect.stringMatching(/^text: /),
        expect.stringMatching(/^lable: /),
      ]),
    );
    expect(received).toEqual([]);
  });

  test('refuses a body larger than 64 KB', async () => {
    const { port, received } = await startWebhook();
    const huge = JSON.stringify({ ...DEPLOY, kind: 'x'.repeat(70_000) });
    expect((await post(port, huge, { secret: SECRET })).status).toBe(413);
    expect(received).toEqual([]);
  });

  test('refuses a secret short enough to guess', () => {
    const options = { port: 0, secret: 'short', clock: createFakeClock(), onEvent: () => {} };
    expect(() => createLocalWebhook(options)).toThrow(/at least 16 characters/);
  });

  test('fails to start on a port already taken, and stops listening once stopped', async () => {
    const { port } = await startWebhook();
    const taken = createLocalWebhook({ port, secret: SECRET, clock: createFakeClock(), onEvent: () => {} });
    await expect(taken.start()).rejects.toThrow(/EADDRINUSE/);
    await webhook?.stop();
    await expect(post(port, JSON.stringify(DEPLOY), { secret: SECRET })).rejects.toThrow(/ECONNREFUSED/);
  });

  test('leaves the port free when the IPv6 address is taken', async () => {
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen({ host: '::1', port: 0, ipv6Only: true }, resolve));
    const address = blocker.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;
    const halfway = createLocalWebhook({ port, secret: SECRET, clock: createFakeClock(), onEvent: () => {} });
    await expect(halfway.start()).rejects.toThrow(/EADDRINUSE/);
    await new Promise((resolve) => blocker.close(resolve));
    await expect(post(port, JSON.stringify(DEPLOY), { secret: SECRET })).rejects.toThrow(/ECONNREFUSED/);
  });
});
