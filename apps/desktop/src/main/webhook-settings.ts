import * as v from 'valibot';

/** The port the Local webhook listens on unless the settings or the environment say otherwise. */
export const DEFAULT_WEBHOOK_PORT = 47213;

/** Whether the Local webhook listens, where, and the secret a script must send. */
export interface WebhookSettings {
  /** False once the person turned it off in the settings window. */
  readonly on: boolean;
  readonly port: number;
  readonly secret: string;
  /** True when the secret comes from the environment, where the app cannot draw a new one. */
  readonly secretIsFixed: boolean;
}

/** The part of `settings.json` read here; the connected Sources are read by `readSources`. */
const SETTINGS_FILE = v.object({
  localWebhook: v.optional(
    v.object({
      enabled: v.optional(v.boolean()),
      // A port the system reserves is ignored without losing the rest.
      port: v.optional(v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1024), v.maxValue(65_535)), 0)),
    }),
  ),
});

/**
 * Returns the Local webhook's settings: on unless `settings.json` says otherwise; the port from the environment,
 * else from `settings.json`, else the default; the secret from the environment, else `keptSecret()`, which reads it
 * from the Keychain or draws and keeps one. An unreadable settings file is ignored, and the secret is never read
 * from a file. The menu bar copies a ready-made `curl` command with it.
 * @example
 * webhookSettings({}, '{"localWebhook":{"port":5000}}', () => 'f3a9…');
 * // { on: true, port: 5000, secret: 'f3a9…', secretIsFixed: false }
 * webhookSettings({ DESKORAMA_WEBHOOK_PORT: '6000' }, null, () => 'f3a9…').port; // 6000
 */
export function webhookSettings(
  env: Readonly<Record<string, string | undefined>>,
  settingsFile: string | null,
  keptSecret: () => string,
): WebhookSettings {
  const inFile = webhookInFile(settingsFile);

  const fromEnv = Number(env['DESKORAMA_WEBHOOK_PORT']);
  const port = Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : inFile.port || DEFAULT_WEBHOOK_PORT;

  // Set but empty counts as not set: no script could send an empty secret.
  const fixed = env['DESKORAMA_WEBHOOK_SECRET'] || undefined;

  return { on: inFile.enabled ?? true, port, secret: fixed ?? keptSecret(), secretIsFixed: fixed !== undefined };
}

/**
 * Returns what `settings.json` says of the Local webhook: nothing when there is no file or it is invalid, and a
 * port of 0 for one the system reserves.
 * @example
 * webhookInFile('{"localWebhook":{"port":5000,"enabled":false}}'); // { port: 5000, enabled: false }
 * webhookInFile('not json'); // {}
 */
function webhookInFile(settingsFile: string | null): {
  readonly port?: number | undefined;
  readonly enabled?: boolean | undefined;
} {
  if (settingsFile === null) return {};

  try {
    const parsed = v.safeParse(SETTINGS_FILE, JSON.parse(settingsFile));

    return parsed.success ? (parsed.output.localWebhook ?? {}) : {};
  } catch {
    return {};
  }
}
