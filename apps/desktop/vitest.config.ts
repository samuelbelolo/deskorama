import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

// The app's pure pieces are tested in Node, and the settings window in a real browser (headless Chromium), driven
// through a fake of its bridge; the packaged app is driven end to end from e2e/.
const config: ViteUserConfig = defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'main',
          include: ['__tests__/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'window',
          include: ['__tests__/window/*.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // The size the settings window opens at.
            viewport: { width: 780, height: 568 },
          },
        },
      },
    ],
  },
});

export default config;
