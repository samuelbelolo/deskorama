import type { Connector } from '@deskorama/core';
import type { CopyChoice } from '../../shared/settings-bridge.ts';
import type { TestEventChoice } from '../../shared/test-event-choice.ts';
import type { WebhookControl } from '../create-webhook-control.ts';
import { displayLanguage } from '../display-language.ts';
import type { SceneControl } from '../scene/create-scene-control.ts';
import { webhookAddress } from '../webhook-address.ts';
import { webhookExample } from '../webhook-example.ts';
import { accentColour } from './accent-colour.ts';
import type { SettingsService } from './create-settings-service.ts';
import type { SettingsActions } from './register-settings-ipc.ts';
import type { SystemAccess } from './system-access.ts';
import { tokenPageUrl } from './token-page-url.ts';
import { wallpaperView } from './wallpaper-view.ts';
import { webhookView } from './webhook-view.ts';

/** What the settings page's requests act on. */
export interface SettingsActionsOptions {
  readonly service: SettingsService;
  readonly scene: SceneControl;
  readonly webhook: WebhookControl;
  /** The Connectors whose token pages the window may open. */
  readonly connectors: readonly Connector[];
  readonly playTest: (choice: TestEventChoice) => void;
  readonly system: SystemAccess;
}

/**
 * Returns everything the settings page may ask: the Sources through `service`, the wallpaper's setup through
 * `scene`, the Local webhook through `webhook`, the test Events through `playTest`, and the Mac itself (its accent
 * colour, its browser, its clipboard, opening at login) through `system`. What it shows is in the display language.
 * @example
 * const actions = settingsActions({ service, scene, webhook, connectors: CONNECTORS, playTest, system });
 * actions.snapshot().lang; // "fr" on a Mac in French
 */
export function settingsActions(options: SettingsActionsOptions): SettingsActions {
  const { service, scene, webhook, system } = options;

  /** The text of one thing the window may copy, with the real secret where the window only names it. */
  const copied = (choice: CopyChoice): string => {
    const address = webhookAddress(webhook.state().port);

    if (choice === 'webhook-address') return address;

    if (choice === 'webhook-secret') return webhook.secret();

    return webhookExample(address, webhook.secret(), scene.lang());
  };

  return {
    ...service,

    snapshot: () => ({
      ...service.snapshot(),
      lang: scene.lang(),
      systemLang: displayLanguage(system.languages()),
      now: system.now(),
      accent: accentColour(system.accent()),
      wallpaper: wallpaperView(scene, system.loginItem()),
      webhook: webhookView(webhook, scene.lang()),
    }),

    setPreferences: (change) => scene.setPreferences(change),
    setOpenAtLogin: (on) => system.setOpenAtLogin(on),
    playTest: options.playTest,

    openTokenPage(id, values) {
      const connector = options.connectors.find((candidate) => candidate.id === id);
      const url = connector === undefined ? null : tokenPageUrl(connector, values);

      if (url !== null) system.openExternal(url);
    },

    copy: (choice) => system.copy(copied(choice)),
    revealSecret: () => webhook.secret(),
    setWebhookOn: (on) => webhook.setOn(on),
    regenerateSecret: () => webhook.regenerate(),
  };
}
