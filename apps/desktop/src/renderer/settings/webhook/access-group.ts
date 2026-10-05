import type { Clock } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import { copyButton } from '../controls/copy-button.ts';
import { iconButton } from '../controls/icon-button.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions, WindowView } from '../window-view.ts';

/** What stands for the secret while it is masked. */
const MASK = '•'.repeat(22);

/**
 * Returns what a script needs to reach the Local webhook: its address and its secret, each with a copy button. The
 * secret is masked until the person asks to see it, and is copied without ever being shown.
 * @example
 * accessGroup(view, actions, bridge, clock);
 * // "Address http://127.0.0.1:47213/events [copy]", "Secret •••• [show] [copy]"
 */
export function accessGroup(
  view: WindowView,
  actions: WindowActions,
  bridge: Pick<SettingsBridge, 'copy'>,
  clock: Clock,
): HTMLElement {
  const { lang, webhook } = view.snapshot;
  const text = SETTINGS_TEXT[lang];
  const shown = view.secret !== null;

  return element('div', { className: 'group' }, [
    element('div', { className: 'row' }, [
      element('span', { className: 'form-label', text: text.address }),
      element('div', { className: 'copy-field' }, [
        element('code', { text: webhook.address }),
        copyButton(text.copy, () => bridge.copy('webhook-address'), clock),
      ]),
    ]),
    element('div', { className: 'row' }, [
      element('span', { className: 'form-label', text: text.secret }),
      element('div', { className: 'copy-field' }, [
        element('code', { className: shown ? '' : 'secret', text: view.secret ?? MASK }),
        iconButton(shown ? 'eye-slash' : 'eye', shown ? text.hide : text.show, actions.toggleSecret),
        copyButton(text.copy, () => bridge.copy('webhook-secret'), clock),
      ]),
    ]),
  ]);
}
