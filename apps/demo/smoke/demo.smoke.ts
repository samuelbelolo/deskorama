import { expect, test } from '@playwright/test';
import { DEMO_THEMES } from '../src/demo-themes.ts';
import { DEMO_SOURCES } from '../src/sources/demo-sources.ts';

/**
 * Returns a pattern matching a label however a Theme paints it: in any case, with either apostrophe.
 * @example
 * captionOf('Nouveau membre dans l’équipe').test("NOUVEAU MEMBRE DANS L'ÉQUIPE"); // true
 */
function captionOf(label: string): RegExp {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");

  return new RegExp(escaped, 'i');
}

for (const { id: theme } of DEMO_THEMES) {
  for (const { id: source, profile } of DEMO_SOURCES) {
    test(`an Event of ${profile.name} shows its Caption in ${theme}, with no page error`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto('./?lang=en');
      await expect(page.locator('[data-theme="aeroport"]')).toBeVisible();

      // Real time: the Source's own Events stay rare, so the triggered one plays first.
      await page.locator('#speeds button[data-value="1"]').click();
      await page.locator('#theme').selectOption(theme);
      await expect(page.locator(`[data-theme="${theme}"]`)).toBeVisible();
      await page.locator('#source').selectOption(source);

      const trigger = page.locator('#triggers button[data-rarity="notable"]').first();
      const label = (await trigger.textContent()) ?? '';
      expect(label).not.toBe('');

      await trigger.click();
      await expect(page.locator('[data-part="caption-fact"]').filter({ hasText: captionOf(label) })).toBeVisible({
        timeout: 15_000,
      });

      expect(errors).toEqual([]);
    });
  }
}
