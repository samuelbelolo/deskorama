# Contributing

Thanks for helping. This file covers how to set up the repository, the rules the code follows, and how to propose a change.

## Set up

You need Node.js 24 (see `.nvmrc`) and Corepack, which ships with Node. pnpm's version comes from `packageManager` in `package.json`.

```sh
corepack enable
pnpm install
# Themes are tested in a real browser: install headless Chromium once.
pnpm --filter @deskorama/theme-aeroport exec playwright install chromium
pnpm check
```

`pnpm check` runs everything CI runs, through Turborepo: oxlint with type-aware rules, the oxfmt format check, dependency-cruiser's layering rules, knip, the TypeScript type-check and every test. Run `pnpm format` to format the files.

To work on the demo: `pnpm --filter @deskorama/demo dev`.

To work on the macOS app: `pnpm --filter @deskorama/desktop build`, then `pnpm --filter @deskorama/desktop start`. `pnpm e2e` packages the app and drives it with Playwright (macOS only, about a minute). Releases are described in [docs/releasing.md](../docs/releasing.md).

## Words

Use the project's words: Source, Connector, Event, Role (`archetype` in code), Gauge, Theme, Gag, Caption.

## Layout and layering

| Folder                 | What lives there                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `packages/core`        | The Event shapes, the Connector, Theme and Host contracts, the Clock, the random generator, the engine |
| `packages/connectors/` | One package per Connector: the Feed and the Local webhook for now                                      |
| `packages/event-json`  | The JSON form of an Event, shared by the Feed and the Local webhook                                    |
| `packages/themes/`     | One package per Theme                                                                                  |
| `packages/test-utils`  | A fake host, a fake Clock, a fake `fetch`, Event fixtures and the Connector contract suite             |
| `apps/demo`            | The demo on GitHub Pages                                                                               |
| `apps/desktop`         | The macOS app: main process, preload bridges, wallpaper pages and the settings window                  |
| `e2e`                  | Playwright tests of the packaged app                                                                   |

Dependencies point inward, and CI fails otherwise:

- core has no runtime dependency;
- Connectors and Themes depend on core, never on each other (Connectors may also use the Event JSON package);
- nothing imports an app;
- only tests import `test-utils`.

Internal packages are consumed as TypeScript source; only the demo and the macOS app are built. The contracts between the layers and the macOS app's structure are described in [docs/architecture.md](../docs/architecture.md).

## Code rules

- **One concern per file**, named after what it exports. No `utils` or `helpers` files.
- **Short files and functions**: under about 300 lines per file and 60 per function.
- **JSDoc on every function**, with one sentence on what it returns or does and an `@example`.
- **Comments and docs in English.**
- **Time and randomness are injected.** Nothing reads `Date.now`, `performance.now`, `Math.random`, `setTimeout` or `requestAnimationFrame` directly, except the platform's own Clocks (the demo's `create-browser-clock.ts`, the app's `create-node-clock.ts` and `create-renderer-clock.ts`); the app's main process alone draws seeds and secrets from the system. A Gag is a function of the Event, the time and the seed.
- **A Theme dispatches on `archetype` only**, never on `kind`, and never names a Source. Every string it draws exists in French and English; a test fails on a missing key.
- **No real data.** Sources, products and domains in fixtures and the demo are fictional (use `.example` domains), and no Event carries personal data.

## Tests

Tests live in a `__tests__/` folder beside each package's `src/`. A good test drives a module through its public contract and asserts what an outside observer sees; it steps the fake Clock instead of waiting. Core, Connectors, test-utils and the demo run in Node; Themes run in Vitest browser mode.

A new Connector calls `describeConnectorContract` from `test-utils` with recorded responses, so it passes the same checks as the others without network access.

### Reference screenshots

Each Theme's `screenshots.test.ts` compares what the Theme draws with reference screenshots, committed in its `__tests__/__screenshots__/` folder. A browser does not draw the same pixels on every system, so the references are Linux ones, drawn on the image CI runs on, and the comparison is skipped on other systems: on a Mac, `pnpm check` passes without it.

After a visual change you intended, or for a new drawing:

1. Push your branch and run the **Reference screenshots** workflow on it, from the Actions tab or with `gh workflow run screenshots.yml --ref your-branch`. In a fork, run it in your fork.
2. Replace the references with the images the run uploaded:

   ```sh
   rm -rf packages/themes/*/__tests__/__screenshots__
   gh run download <run-id> --name reference-screenshots --dir packages/themes
   ```

3. Look at the images Git reports as changed, then commit them with your change.

Do not make references with `vitest --update` on your own machine: CI would compare them with another system's drawing. When a comparison fails in CI, the run's `theme-screenshot-diffs` artifact holds what was drawn and the difference.

## Proposing a change

1. Open an issue first for anything larger than a fix, so we agree on the approach.
2. Keep a pull request to one change, with tests.
3. Write commit messages as [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat: …`, `fix: …`, `docs: …`); releases and the changelog are generated from them.
4. Make sure `pnpm check` passes.

Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md). Security issues go through the [security policy](SECURITY.md), not public issues.
