import { describe, expect, test } from 'vitest';
import { DEFAULT_WEBHOOK_PORT, webhookSettings } from '../src/main/webhook-settings.ts';

const kept = (): string => 'secret-kept-in-the-keychain';

describe('the Local webhook settings', () => {
  test('use the default port and the secret kept in the Keychain', () => {
    expect(webhookSettings({}, null, kept)).toEqual({
      port: DEFAULT_WEBHOOK_PORT,
      secret: 'secret-kept-in-the-keychain',
    });
  });

  test('take the port from settings.json', () => {
    expect(webhookSettings({}, '{"localWebhook":{"port":5000}}', kept).port).toBe(5000);
  });

  test('ignore a settings file that is not valid, or a port the system reserves', () => {
    expect(webhookSettings({}, '{"localWebhook":', kept).port).toBe(DEFAULT_WEBHOOK_PORT);
    expect(webhookSettings({}, '{"localWebhook":{"port":80}}', kept).port).toBe(DEFAULT_WEBHOOK_PORT);
  });

  test('let the environment override the port and the secret, as the end-to-end test does', () => {
    const env = { DESKORAMA_WEBHOOK_PORT: '47299', DESKORAMA_WEBHOOK_SECRET: 'e2e-local-webhook-secret' };
    expect(webhookSettings(env, '{"localWebhook":{"port":5000}}', kept)).toEqual({
      port: 47_299,
      secret: 'e2e-local-webhook-secret',
    });
  });
});
