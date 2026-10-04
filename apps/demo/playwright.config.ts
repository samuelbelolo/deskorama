import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

/** Where the built demo is served for the smoke test, apart from the dev server's port. */
const PREVIEW_URL = 'http://localhost:4317/';

// Opens the built demo, as GitHub Pages serves it: the smoke test checks what visitors get, not the dev server.
const config: PlaywrightTestConfig = defineConfig({
  testDir: 'smoke',
  testMatch: '*.smoke.ts',
  timeout: 60_000,
  reporter: [['list']],
  use: { baseURL: PREVIEW_URL },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4317 --strictPort',
    url: PREVIEW_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

export default config;
