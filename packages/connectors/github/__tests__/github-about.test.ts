import { describe, expect, test } from 'vitest';
import { githubAbout } from '../src/github-about.ts';
import { GITHUB_CONFIG } from '../src/github-config.ts';
import { METADATA_PERMISSION } from '../src/github-permissions.ts';

/**
 * Returns the parameter of the token page that presets one permission, from the name the Connector declares.
 * @example
 * pageParameter('Pull requests: read'); // 'pull_requests'
 */
function pageParameter(permission: string): string {
  return permission.slice(0, permission.indexOf(':')).toLowerCase().replaceAll(' ', '_');
}

describe("GitHub's token page", () => {
  test('presets the token’s name and, read-only, every permission the Connector declares', () => {
    const page = githubAbout('private').token.page;
    const preset = Object.fromEntries(new URL(page?.url ?? '').searchParams);

    // Metadata comes with any other permission, and a link cannot preset it.
    const declared = GITHUB_CONFIG.permissions
      .filter((permission) => permission.name !== METADATA_PERMISSION)
      .map((permission): [string, string] => [pageParameter(permission.name), 'read']);

    expect(preset).toEqual({ name: 'Deskorama', ...Object.fromEntries(declared) });
  });
});
