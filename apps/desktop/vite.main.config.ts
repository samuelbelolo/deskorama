import { defineConfig, type UserConfig } from 'vite';

// The main process, bundled with every workspace package and valibot into one CommonJS file. Electron, Node's
// built-ins and the Keychain binding stay external: the binding loads a native module, which electron-builder
// ships as the app's one production dependency.
const config: UserConfig = defineConfig({
  define: {
    // Set by the release workflow to `${{ github.repository }}`; empty for a local build, which watches no releases.
    BUILD_REPOSITORY: JSON.stringify(process.env['RELEASE_REPOSITORY'] ?? ''),
  },
  ssr: { noExternal: true, external: ['electron', '@napi-rs/keyring'], target: 'node' },
  build: {
    ssr: 'src/main/main.ts',
    outDir: 'dist/main',
    emptyOutDir: true,
    target: 'node24',
    rolldownOptions: { output: { format: 'cjs', entryFileNames: '[name].cjs' } },
  },
});

export default config;
