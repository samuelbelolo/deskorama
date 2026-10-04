import { defineConfig, type UserConfig } from 'vite';

// A relative base serves the site from any GitHub Pages path, whatever the repository is called.
const config: UserConfig = defineConfig({
  base: './',
});

export default config;
