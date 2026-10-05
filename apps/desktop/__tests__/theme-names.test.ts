import { expect, test } from 'vitest';
import { THEME_ABOUTS } from '../src/renderer/settings/theme-abouts.ts';
import { AVAILABLE_THEMES, THEME_CHOICES } from '../src/shared/theme-choice.ts';

// The menu bar names a Theme from the app's own list, the settings window from the Theme's package: one name.
test.for(AVAILABLE_THEMES)('the menu bar and the settings window give %s the same name', (id) => {
  const choice = THEME_CHOICES.find((candidate) => candidate.id === id);

  expect(choice?.name).toBe(THEME_ABOUTS[id].name);
});
