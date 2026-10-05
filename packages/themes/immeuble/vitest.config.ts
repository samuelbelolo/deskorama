import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

// Themes draw in a real browser: Vitest browser mode with headless Chromium.
const config: ViteUserConfig = defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          // A pixel counts as changed once its colour moves by more than a tenth of the scale, which leaves room for
          // a one-step difference in antialiasing, and no pixel may change. Measured on 5 October 2026: two CI
          // runners drew every reference byte for byte alike, and one changed Gauge digit moves 128 pixels or more.
          comparatorOptions: { threshold: 0.1, allowedMismatchedPixels: 0 },
        },
      },
    },
  },
});

export default config;
