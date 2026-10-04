import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

// Drives the packaged app built by `pnpm --filter @deskorama/desktop package:e2e`. One app at a time: it owns
// every display and the Local webhook's port.
const config: PlaywrightTestConfig = defineConfig({
  testDir: '__tests__',
  testMatch: '*.test.ts',
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  forbidOnly: process.env['CI'] !== undefined,
  reporter: [['list']],
});

export default config;
