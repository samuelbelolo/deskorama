import { describe, expect, test } from 'vitest';
import { fetchLatestRelease, type Fetch } from '../src/main/fetch-latest-release.ts';

const REPOSITORY = 'samuelbelolo/deskorama';
const PAGE = `https://github.com/${REPOSITORY}/releases/tag/v0.3.0`;
const DMG = `https://github.com/${REPOSITORY}/releases/download/v0.3.0/Deskorama-0.3.0-mac-arm64.dmg`;

/**
 * Returns a fake GitHub whose latest release is v0.3.0 with these files.
 * @example
 * github([{ name: 'Deskorama-0.3.0-mac-arm64.dmg', browser_download_url: DMG }]);
 * // a Fetch answering v0.3.0 with these files
 */
function github(assets: { name: string; browser_download_url: string }[]): Fetch {
  return async () => Response.json({ tag_name: 'v0.3.0', html_url: PAGE, assets });
}

const FILES = [
  { name: 'Deskorama-0.3.0-mac-arm64.zip', browser_download_url: DMG.replace('.dmg', '.zip') },
  { name: 'Deskorama-0.3.0-mac-arm64.dmg', browser_download_url: DMG },
];

describe('the latest release', () => {
  test("points at the dmg built for the Mac's processor", async () => {
    expect(await fetchLatestRelease(github(FILES), REPOSITORY, 'arm64')).toEqual({ tag: 'v0.3.0', url: DMG });
  });

  test('points at its page when no dmg was built for that processor', async () => {
    expect(await fetchLatestRelease(github(FILES), REPOSITORY, 'x64')).toEqual({ tag: 'v0.3.0', url: PAGE });
  });

  test('points at its page when the dmg lives outside the repository', async () => {
    const elsewhere = [{ name: 'Deskorama-0.3.0-mac-arm64.dmg', browser_download_url: 'https://tramlo.example/x.dmg' }];

    expect(await fetchLatestRelease(github(elsewhere), REPOSITORY, 'arm64')).toEqual({ tag: 'v0.3.0', url: PAGE });
  });
});
