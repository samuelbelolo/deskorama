import { expect, test } from '@playwright/test';
import { launchDesktop } from '../src/launch-desktop.ts';
import { postEvent } from '../src/post-event.ts';
import { sampleCpu } from '../src/sample-cpu.ts';

/** A release of Tramlo, a fictional product, as its CI on this Mac would announce it. */
const RELEASE = {
  id: 'tramlo-release-2-5-0',
  kind: 'release.published',
  archetype: 'publish',
  rarity: 'notable',
  source: 'Tramlo CI',
  text: {
    fr: { label: 'Nouvelle version publiée', detail: 'v2.5.0 avec l’export PDF', tag: 'v2.5.0' },
    en: { label: 'New release published', detail: 'v2.5.0 with PDF export', tag: 'v2.5.0' },
  },
};

test('an Event posted to the Local webhook shows its Caption on the desktop', async () => {
  const { app, port, secret } = await launchDesktop();
  let errors = '';
  app.process().stderr?.on('data', (chunk: Buffer) => (errors += chunk.toString()));
  try {
    const page = await app.firstWindow();
    await expect(page.locator('[data-theme="aeroport"]')).toBeVisible();
    // A menu-bar app: no Dock icon, once its windows are up.
    await expect.poll(() => app.evaluate(({ app: electronApp }) => electronApp.dock?.isVisible() ?? false)).toBe(false);
    // The app speaks the Mac's language: the Caption is in French or English.
    const lang = (await page.locator('[data-theme="aeroport"]').getAttribute('lang')) === 'fr' ? 'fr' : 'en';
    test.info().annotations.push({ type: 'cpu idle, %', description: (await sampleCpu(app, 3000)).toFixed(1) });

    expect(await postEvent(port, secret, RELEASE)).toBe(202);

    await expect(page.locator('[data-part="caption-source"]')).toHaveText('Tramlo CI');
    await expect(page.locator('[data-part="caption-fact"]')).toHaveText(RELEASE.text[lang].label);
    await expect(page.locator('[data-part="caption-detail"]')).toHaveText(RELEASE.text[lang].detail);
    await page.screenshot({ path: test.info().outputPath('caption.png') });
    // The main process logs a failed start, menu-bar or Local webhook error under these topics.
    expect(errors).not.toMatch(/^\[(app|tray|webhook)\]/m);
  } finally {
    await app.close();
  }
});

test('the Local webhook turns away a request without the secret, and nothing plays', async () => {
  const { app, port } = await launchDesktop();
  try {
    const page = await app.firstWindow();
    await expect(page.locator('[data-theme="aeroport"]')).toBeVisible();
    expect(await postEvent(port, 'not-the-secret-at-all', RELEASE)).toBe(401);
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-part="caption"]')).toHaveCount(0);
  } finally {
    await app.close();
  }
});
