import { defineConfig, type UserConfig } from 'vite';

// The preloads of the wallpaper and settings windows, each as one CommonJS file: a sandboxed preload cannot load
// ES modules nor anything but `electron`.
const config: UserConfig = defineConfig({
  ssr: { noExternal: true, external: ['electron'], target: 'node' },
  build: {
    ssr: true,
    outDir: 'dist/preload',
    emptyOutDir: true,
    target: 'node24',
    rolldownOptions: {
      input: { preload: 'src/preload/preload.ts', 'settings-preload': 'src/preload/settings-preload.ts' },
      output: { format: 'cjs', entryFileNames: '[name].cjs' },
    },
  },
});

export default config;
