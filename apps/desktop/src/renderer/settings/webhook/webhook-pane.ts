import type { Clock } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import { copyButton } from '../controls/copy-button.ts';
import { pushButton } from '../controls/push-button.ts';
import { toggle } from '../controls/toggle.ts';
import { element } from '../element.ts';
import { logoTile } from '../logo-tile.ts';
import { statusLine } from '../status-line.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions, WindowView } from '../window-view.ts';
import { accessGroup } from './access-group.ts';
import { receivedEvents } from './received-events.ts';

/**
 * Returns the Local webhook pane: a switch, with a warning when its port is taken, its address and its secret to
 * copy, a one-line `curl` to try it from Terminal, and the latest Events it received. A new secret that could not
 * be drawn is said above the access it leaves unchanged.
 * @example
 * webhookPane(view, actions, bridge, clock);
 * // [the switch, "Access for your scripts", the group, the example, the Events]
 */
export function webhookPane(
  view: WindowView,
  actions: WindowActions,
  bridge: Pick<SettingsBridge, 'copy'>,
  clock: Clock,
): Node[] {
  const { lang, webhook, now } = view.snapshot;
  const text = SETTINGS_TEXT[lang];

  const on = element('div', { className: 'group' }, [
    element('div', { className: 'row' }, [
      logoTile(webhook.about.logo, 30),
      element('div', { className: 'row-label' }, [
        element('span', { text: text.webhookOn }),
        element('span', { className: 'sub', text: webhook.about.pitch[lang] }),
      ]),
      toggle(text.webhookOn, webhook.on, actions.setWebhookOn),
    ]),
  ]);

  const taken = webhook.on && !webhook.listening ? statusLine('bad', text.portTaken(webhook.address)) : null;
  const failed = view.regenerateFailed ? statusLine('bad', text.regenerateFailed) : null;

  for (const line of [taken, failed]) line?.classList.add('pane-status');

  return [
    on,
    taken,
    element('div', { className: 'section-head' }, [
      element('h2', { className: 'section-title', text: text.access }),
      webhook.canRegenerate ? pushButton(text.regenerate, actions.regenerateSecret) : null,
    ]),
    failed,
    accessGroup(view, actions, bridge, clock),
    element('h2', { className: 'section-title', text: text.example }),
    element('div', { className: 'terminal' }, [
      element('code', { text: webhook.example }),
      copyButton(text.copy, () => bridge.copy('webhook-example'), clock),
    ]),
    element('p', { className: 'section-note', text: text.exampleNote }),
    element('h2', { className: 'section-title', text: text.received }),
    receivedEvents(webhook.recent, now, lang),
  ].filter((node) => node !== null);
}
