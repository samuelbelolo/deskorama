# Releasing the macOS app

How a release is made, and the one-time setup only the repository owner can do.

The app is signed ad hoc, not with an Apple Developer ID, and is not notarized: a release needs no Apple account, no certificate and no secret, at the cost of one more step the first time someone opens the app. For the same reason it cannot update itself; it watches this repository's releases and offers the new one in the menu bar.

## How a release happens

1. Commits land on `main` as [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat: …`, `fix: …`).
2. The **Release** workflow (`.github/workflows/release.yml`) keeps a release pull request open. It holds the next version, computed from those commits (0.x while the app is young: a `feat` bumps the minor version), and the `CHANGELOG.md` entry. It updates the version in `package.json` and `apps/desktop/package.json`.
3. Merging that pull request tags `vX.Y.Z` and creates a **draft** GitHub release.
4. The `mac` job, on a macOS runner, builds the app so that it watches this repository for new releases. It packages the app with an ad-hoc signature, checks that the signature survives the zip, attaches `Deskorama-X.Y.Z-mac-arm64.dmg` and `.zip`, and publishes the release.
5. Within the hour, installed apps offer "Download version X.Y.Z…" in the menu bar, which downloads the dmg built for the Mac's processor, or opens the release page when there is none.

If a step fails, the release stays a draft, so nobody is told about a release without its downloads. When the failure was passing, re-run the failed job. When it needed a fix, merge the fix (as `ci:` or `build:`, so it opens no new release), then run the workflow by hand with the draft's tag: `gh workflow run Release -f tag=vX.Y.Z`. It builds the current `main`, and refuses to if the app's version is not the tag's.

## One-time setup (repository owner)

The release needs no secret: the app is not signed with an Apple Developer ID.

- The repository is **public**, so installed apps can read its latest release without a token.
- In **Settings → Actions → General → Workflow permissions**, choose "Read and write permissions" and tick "Allow GitHub Actions to create and approve pull requests". Release Please needs both to open its pull request.
- Optional: pull requests opened with the default `GITHUB_TOKEN` do not start other workflows, so CI does not run on the release pull request. To have it run, give the release-please step a token from a GitHub App or a fine-grained personal access token.

To make the first release, merge a `feat:` commit to `main`, then merge the release pull request that follows, and watch the Release workflow.

## Installing a release (what people see)

The app is signed ad hoc, not by an identified developer, so macOS refuses to open it the first time:

1. Open the dmg and drag Deskorama to Applications.
2. Open Deskorama. macOS says it cannot check the app; choose **Done**.
3. In **System Settings → Privacy & Security**, under Security, choose **Open Anyway** next to Deskorama, then confirm.

macOS remembers the choice. A new version means downloading the new dmg and replacing the app; the menu bar says when one is out.

## Local builds

`pnpm e2e` builds the app in `apps/desktop/release/mac-arm64/` and drives it with Playwright. That build keeps the `--inspect` fuse on for Playwright and never looks for new releases; do not distribute it. `pnpm --filter @deskorama/desktop build && pnpm --filter @deskorama/desktop package` makes the same dmg and zip as a release, without the release watch unless `RELEASE_REPOSITORY=owner/repo` is set for the build.

The app's icon is `apps/desktop/resources/icon.icns`, built from the two drawings beside it: `icon.svg`, and `icon-small.svg` for the 16 and 32 pixel sizes. After editing a drawing, run `sh apps/desktop/resources/build-icon.sh` (it needs `rsvg-convert`, from `brew install librsvg`) and commit the new `icon.icns`.
