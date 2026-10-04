import { createLocalWebhook } from '@deskorama/connector-local-webhook';
import type { Clock, SourceEvent } from '@deskorama/core';
import { randomBytes } from 'node:crypto';
import { keptSecret } from './kept-secret.ts';
import { readSettingsFile } from './read-settings-file.ts';
import type { TokenStore } from './sources/token-store.ts';
import { webhookSettings, type WebhookSettings } from './webhook-settings.ts';
import { writeLog } from './write-log.ts';

/** The running Local webhook, as the menu bar shows it. */
export interface RunningWebhook {
  readonly settings: WebhookSettings;
  /** False when the port was taken: the app runs on, without the Local webhook. */
  readonly listening: boolean;
  readonly stop: () => Promise<void>;
}

/**
 * Starts the Local webhook on the loopback interface with its settings, and hands every Event it accepts to
 * `onEvent`. Its secret is drawn once and kept in `secrets`, the Keychain, so scripts keep working across
 * launches. A port already taken is logged and reported, never fatal.
 * @example
 * const webhook = await startLocalWebhook(sendEvent, clock, app.getPath('userData'), createKeychain(''));
 * webhook.listening; // true
 */
export async function startLocalWebhook(
  onEvent: (event: SourceEvent) => void,
  clock: Clock,
  userData: string,
  secrets: TokenStore,
): Promise<RunningWebhook> {
  const settings = webhookSettings(process.env, readSettingsFile(userData), () =>
    keptSecret(secrets, 'local-webhook', () => randomBytes(24).toString('base64url')),
  );

  const webhook = createLocalWebhook({
    ...settings,
    clock,
    onEvent,
  });

  try {
    await webhook.start();

    return { settings, listening: true, stop: () => webhook.stop() };
  } catch (error) {
    writeLog('webhook', String(error));

    return { settings, listening: false, stop: async () => {} };
  }
}
