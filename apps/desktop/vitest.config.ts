import { defineConfig, type ViteUserConfig } from 'vitest/config';

// The app's pure pieces are tested in Node; the packaged app is driven end to end from e2e/.
const config: ViteUserConfig = defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    environment: 'node',
  },
});

export default config;
