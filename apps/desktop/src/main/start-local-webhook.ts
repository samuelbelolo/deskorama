import { createLocalWebhook } from '@deskorama/connector-local-webhook';
import type { Clock, SourceEvent } from '@deskorama/core';
import { randomBytes } from 'node:crypto';
import { createWebhookControl, type WebhookControl } from './create-webhook-control.ts';
import { keptSecret } from './kept-secret.ts';
import { readSettingsFile } from './read-settings-file.ts';
import { settingsPath } from './settings-path.ts';
import type { TokenStore } from './sources/token-store.ts';
import { webhookSettings } from './webhook-settings.ts';
import { withWebhookOn } from './with-webhook-on.ts';
import { writeFileAtomically } from './write-file-atomically.ts';
import { writeLog } from './write-log.ts';

/** The Keychain item that holds the Local webhook's secret. */
const SECRET_KEY = 'local-webhook';

/**
 * Starts the Local webhook on the loopback interface with its settings, unless the person turned it off, and hands
 * every Event it accepts to `onEvent`. Its secret is drawn once and kept in `secrets`, the Keychain, so scripts keep
 * working across launches, until the person asks for a new one. A port already taken is logged and reported, never
 * fatal. Turning it on or off is kept in `settings.json`.
 * @example
 * const webhook = await startLocalWebhook(sendEvent, clock, app.getPath('userData'), createKeychain(''));
 * webhook.state().listening; // true
 */
export async function startLocalWebhook(
  onEvent: (event: SourceEvent) => void,
  clock: Clock,
  userData: string,
  secrets: TokenStore,
): Promise<WebhookControl> {
  const settings = webhookSettings(process.env, readSettingsFile(userData), () =>
    keptSecret(secrets, SECRET_KEY, draw),
  );

  /** Draws a new secret and keeps it; a Keychain that refuses it leaves the current secret in place. */
  const redraw = (): string => {
    const drawn = draw();

    secrets.write(SECRET_KEY, drawn);

    return drawn;
  };

  const control = createWebhookControl({
    on: settings.on,
    port: settings.port,
    secret: settings.secret,
    redraw: settings.secretIsFixed ? null : redraw,
    saveOn: (on) => writeFileAtomically(settingsPath(userData), withWebhookOn(readSettingsFile(userData), on)),
    listen: (secret, accept) => createLocalWebhook({ port: settings.port, secret, clock, onEvent: accept }),
    onEvent,
    onError: (error) => writeLog('webhook', String(error)),
  });

  await control.start();

  return control;
}

/**
 * Returns a new secret: 24 random bytes, written so a shell and a header take them as they are.
 * @example
 * draw(); // 'q7Zt…' (32 characters)
 */
function draw(): string {
  return randomBytes(24).toString('base64url');
}
