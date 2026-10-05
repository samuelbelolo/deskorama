import type { ElectronApplication, Page } from '@playwright/test';

/**
 * Returns the wallpaper pages that show a Caption right now. The app opens one page per display and plays an Event
 * on one of them, so a Mac with several screens shows the Caption on whichever the app drew.
 * @example
 * await expect.poll(async () => (await captionPages(app)).length).toBe(1);
 */
export async function captionPages(app: ElectronApplication): Promise<Page[]> {
  const pages = app.windows().filter((page) => !page.isClosed());
  const counts = await Promise.all(pages.map((page) => page.locator('[data-part="caption"]').count()));

  return pages.filter((_page, index) => (counts[index] ?? 0) > 0);
}
