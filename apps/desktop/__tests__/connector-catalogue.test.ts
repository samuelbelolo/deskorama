import { LOCAL_WEBHOOK_ABOUT } from '@deskorama/connector-local-webhook/about';
import { LANGUAGES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { CONNECTORS } from '../src/main/connectors.ts';
import { connectorView } from '../src/main/settings-window/connector-view.ts';
import { tokenPageUrl } from '../src/main/settings-window/token-page-url.ts';

/** An em dash or an en dash, which no visible string may contain. */
const DASH = /[\u2013\u2014]/;

describe('what each Connector says of itself', () => {
  test.for(CONNECTORS)('$id has a logo, a one-line pitch and a token note in every language', (connector) => {
    const { logo, pitch, token } = connector.about;

    expect(logo.path).toMatch(/^[Mm]/);
    expect(logo.size).toBeGreaterThan(0);
    expect(logo.markColour).toMatch(/^#[0-9a-f]{6}$/);
    expect(logo.tileColour).toMatch(/^#[0-9a-f]{6}$/);

    for (const lang of LANGUAGES) {
      for (const said of [pitch[lang], token.name[lang], token.note[lang]]) {
        expect(said.trim()).not.toBe('');
        expect(said).not.toMatch(DASH);
      }

      expect(pitch[lang].length).toBeLessThanOrEqual(80);
    }
  });

  test('every token page is an https address of the service itself', () => {
    const pages = Object.fromEntries(CONNECTORS.map((connector) => [connector.id, tokenPageUrl(connector, {})]));

    expect(pages).toEqual({
      github: expect.stringMatching(/^https:\/\/github\.com\/settings\/personal-access-tokens\/new\?/),
      'github-public': expect.stringMatching(/^https:\/\/github\.com\/settings\/personal-access-tokens\/new\?/),
      vercel: 'https://vercel.com/account/settings/tokens',
      stripe: 'https://dashboard.stripe.com/apikeys',
      sentry: 'https://sentry.io/settings/account/api/auth-tokens/',
      linear: 'https://linear.app/settings/account/security',
      posthog: 'https://us.posthog.com/settings/user-api-keys',
      feed: null,
    });
  });

  test('GitHub’s token page presets the permissions a link can, read-only', () => {
    const github = CONNECTORS.find((connector) => connector.id === 'github');
    const preset = new URL(github?.about.token.page?.url ?? '').searchParams;

    expect(Object.fromEntries(preset)).toEqual({
      name: 'Deskorama',
      contents: 'read',
      pull_requests: 'read',
      issues: 'read',
      actions: 'read',
      deployments: 'read',
    });
  });

  test('a service with several addresses opens its token page on the one the person typed, and nowhere else', () => {
    const posthog = CONNECTORS.find((connector) => connector.id === 'posthog');

    if (posthog === undefined) throw new Error('The app no longer offers PostHog.');

    expect(tokenPageUrl(posthog, { host: ' https://eu.posthog.com/project/12345 ' })).toBe(
      'https://eu.posthog.com/settings/user-api-keys',
    );
    expect(tokenPageUrl(posthog, { host: 'http://eu.posthog.com' })).toBe(
      'https://us.posthog.com/settings/user-api-keys',
    );
    expect(tokenPageUrl(posthog, { host: 'javascript:alert(1)' })).toBe(
      'https://us.posthog.com/settings/user-api-keys',
    );
  });

  test('the window gets each Connector whole, but never its poll', () => {
    const [github] = CONNECTORS;

    if (github === undefined) throw new Error('The app offers no Connector.');

    const view = connectorView(github);

    expect(view).toEqual({
      id: 'github',
      title: github.title,
      about: github.about,
      fields: github.config.fields,
      permissions: github.config.permissions,
      interval: github.config.interval,
      gauges: github.gauges,
    });
    expect(JSON.parse(JSON.stringify(view))).toEqual(view);
  });

  test('the Local webhook has its own tile and says where it listens', () => {
    expect(LOCAL_WEBHOOK_ABOUT.logo.path).toMatch(/^M/);
    expect(LOCAL_WEBHOOK_ABOUT.pitch.en).toBe('Listens on 127.0.0.1 and ::1, never on the network.');
  });
});
