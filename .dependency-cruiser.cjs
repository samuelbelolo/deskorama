// Layering rules of the workspace (docs/architecture.md): dependencies point inward to core.
// Connectors and Themes depend on core and never on each other; nothing imports an app.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-theme-to-connector',
      comment: 'A Theme reacts to Roles only; it never knows which Connector produced an Event.',
      severity: 'error',
      from: { path: '^packages/themes/' },
      to: { path: '^packages/connectors/' },
    },
    {
      name: 'no-connector-to-theme',
      comment: 'A Connector maps its Source onto Roles; it never knows which Theme draws them.',
      severity: 'error',
      from: { path: '^packages/connectors/' },
      to: { path: '^packages/themes/' },
    },
    {
      name: 'no-theme-to-other-theme',
      comment: 'Themes are independent of each other; shared code belongs in core.',
      severity: 'error',
      from: { path: '^packages/themes/([^/]+)/' },
      to: { path: '^packages/themes/', pathNot: '^packages/themes/$1/' },
    },
    {
      name: 'no-connector-to-other-connector',
      comment: 'Connectors are independent of each other; shared code belongs in core.',
      severity: 'error',
      from: { path: '^packages/connectors/([^/]+)/' },
      to: { path: '^packages/connectors/', pathNot: '^packages/connectors/$1/' },
    },
    {
      name: 'no-package-to-app',
      comment: 'Apps wire packages together; a package never imports an app.',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'no-app-to-other-app',
      comment: 'An app imports its own files and packages, never another app.',
      severity: 'error',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/', pathNot: '^apps/$1/' },
    },
    {
      name: 'core-stands-alone',
      comment: 'Core has no runtime dependency: no npm package and no other workspace package.',
      severity: 'error',
      from: { path: '^packages/core/src/' },
      to: { pathNot: '^packages/core/', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'renderer-reaches-main-only-through-the-bridge',
      comment:
        'A wallpaper page runs sandboxed, without Node: it never imports Electron or the main process, only shared types.',
      severity: 'error',
      from: { path: '^apps/desktop/src/renderer/' },
      to: { path: ['^apps/desktop/src/(main|preload)/', '(^|/)node_modules/electron/'] },
    },
    {
      name: 'renderer-without-node',
      comment: 'A wallpaper page has no Node built-ins: node:http and the like exist only in the main process.',
      severity: 'error',
      from: { path: '^apps/desktop/src/renderer/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'main-and-renderer-meet-in-shared',
      comment:
        'The main process and the preload share types and pure helpers with the renderer through src/shared only.',
      severity: 'error',
      from: { path: '^apps/desktop/src/(main|preload|shared)/' },
      to: { path: '^apps/desktop/src/renderer/' },
    },
    {
      name: 'test-utils-only-in-tests',
      comment: 'The fake host, fake Clock and fixtures are for tests; shipped code never imports them.',
      severity: 'error',
      from: { path: '^(packages|apps)/', pathNot: ['/__tests__/', '^packages/test-utils/'] },
      to: { path: '^packages/test-utils/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        'Every import resolves. The one exception is a Phosphor glyph imported as text ("?raw"): the bundler resolves it, and fails the build if it is missing.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true, pathNot: '^@phosphor-icons/core/[^/]+/[^/]+\\.svg\\?raw$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // node_modules is not followed but stays in the graph, so rules see which npm packages a file imports.
    exclude: { path: ['(^|/)dist/', '(^|/)release/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'default', 'types'],
      extensions: ['.ts', '.js'],
    },
  },
};
