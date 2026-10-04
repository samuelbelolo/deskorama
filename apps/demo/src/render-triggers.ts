import type { Language } from '@deskorama/core';
import type { Trigger } from './triggers-of.ts';

/**
 * Fills `container` with one button per Event the visitor can send by hand, labelled in the display language and
 * marked with its rarity; a click calls `send` with its kind.
 * @example
 * renderTriggers(triggers, triggersOf(TRAMLO), 'en', (kind) => session.simulator.trigger(kind));
 * // one button per trigger, the first reading "Commits pushed to main" with data-rarity="common"
 */
export function renderTriggers(
  container: HTMLElement,
  triggers: readonly Trigger[],
  lang: Language,
  send: (kind: string) => void,
): void {
  container.replaceChildren(
    ...triggers.map(({ kind, label, rarity }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trigger';
      button.dataset['kind'] = kind;
      button.dataset['rarity'] = rarity;
      button.textContent = label[lang];
      button.addEventListener('click', () => send(kind));

      return button;
    }),
  );
}
