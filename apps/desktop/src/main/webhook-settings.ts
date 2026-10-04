import * as v from 'valibot';

/** The port the Local webhook listens on unless the settings or the environment say otherwise. */
export const DEFAULT_WEBHOOK_PORT = 47213;

/** Where the Local webhook listens and the secret a script must send. */
export interface WebhookSettings {
  readonly port: number;
  readonly secret: string;
}

/** The part of `settings.json` read here; the connected Sources are read by `readSources`. */
const SETTINGS_FILE = v.object({
  localWebhook: v.optional(
    v.object({ port: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1024), v.maxValue(65_535))) }),
  ),
});

/**
 * Returns the Local webhook's settings: the port from the environment, else from `settings.json`, else the default;
 * the secret from the environment, else `keptSecret()`, which reads it from the Keychain or draws and keeps one. An
 * unreadable settings file is ignored, and the secret is never read from a file. The menu bar copies a ready-made
 * `curl` command with it.
 * @example
 * webhookSettings({}, '{"localWebhook":{"port":5000}}', () => 'f3a9…'); // { port: 5000, secret: 'f3a9…' }
 * webhookSettings({ DESKORAMA_WEBHOOK_PORT: '6000' }, null, () => 'f3a9…').port; // 6000
 */
export function webhookSettings(
  env: Readonly<Record<string, string | undefined>>,
  settingsFile: string | null,
  keptSecret: () => string,
): WebhookSettings {
  const fromEnv = Number(env['DESKORAMA_WEBHOOK_PORT']);
  const port = Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : (portInFile(settingsFile) ?? DEFAULT_WEBHOOK_PORT);

  return { port, secret: env['DESKORAMA_WEBHOOK_SECRET'] ?? keptSecret() };
}

/**
 * Returns the Local webhook port written in `settings.json`, or undefined when there is none or the file is invalid.
 * @example
 * portInFile('{"localWebhook":{"port":5000}}'); // 5000
 * portInFile('not json'); // undefined
 */
function portInFile(settingsFile: string | null): number | undefined {
  if (settingsFile === null) return undefined;

  try {
    const parsed = v.safeParse(SETTINGS_FILE, JSON.parse(settingsFile));

    return parsed.success ? parsed.output.localWebhook?.port : undefined;
  } catch {
    return undefined;
  }
}
