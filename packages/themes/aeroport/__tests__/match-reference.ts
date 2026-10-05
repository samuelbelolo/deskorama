import { expect } from 'vitest';
import type { Locator } from 'vitest/browser';

/** What Vitest says, in any update mode, when a drawing has no reference screenshot yet. */
const NO_REFERENCE = 'No existing reference screenshot found';

/**
 * Compares what a locator shows with its reference screenshot, the committed image of the same name. A drawing
 * with no reference yet fails with how to create one.
 * @example
 * await matchReference(page.elementLocator(root), 'scene-night');
 */
export async function matchReference(locator: Locator, name: string): Promise<void> {
  try {
    await expect.element(locator).toMatchScreenshot(name);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes(NO_REFERENCE)) throw error;

    throw new Error(
      `"${name}" has no reference screenshot. References are made on the CI image, not on your machine: run the ` +
        '"Reference screenshots" workflow on your branch, then commit the images it uploads. ' +
        'See "Reference screenshots" in .github/CONTRIBUTING.md.',
      { cause: error },
    );
  }
}
