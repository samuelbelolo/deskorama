import type { Language } from '@deskorama/core';
import { TEST_EVENT_CHOICES, type TestEventChoice } from '../../shared/test-event-choice.ts';
import { element } from './element.ts';
import { SETTINGS_TEXT } from './settings-text.ts';
import { TEST_EVENT_NAMES } from './test-event-names.ts';

/**
 * Returns the panel that plays a test Event on the wallpaper: one button per Role, and the failed deploy.
 * @example
 * root.append(renderTestPanel('fr', (choice) => void window.settings.playTest(choice))); // 16 buttons, “Arrivée” first
 */
export function renderTestPanel(lang: Language, play: (choice: TestEventChoice) => void): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  const buttons = TEST_EVENT_CHOICES.map((choice) => {
    const button = element('button', { text: TEST_EVENT_NAMES[choice][lang] });

    button.addEventListener('click', () => play(choice));

    return button;
  });

  return element('section', { className: 'panel' }, [
    element('h2', { text: text.tests }),
    element('p', { className: 'hint', text: text.testsLead }),
    element('div', { className: 'tests' }, buttons),
  ]);
}
