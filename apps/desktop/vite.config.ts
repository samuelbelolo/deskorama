import { resolve } from 'node:path';
import { defineConfig, type UserConfig } from 'vite';

// The renderer pages: the wallpaper (one per screen) and the settings window. Relative paths, since the main process
// loads them from the app bundle with loadFile.
const config: UserConfig = defineConfig({
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        wallpaper: resolve(import.meta.dirname, 'src/renderer/index.html'),
        settings: resolve(import.meta.dirname, 'src/renderer/settings/index.html'),
      },
    },
  },
});

export default config;
