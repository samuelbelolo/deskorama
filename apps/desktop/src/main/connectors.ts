import { createFeed } from '@deskorama/connector-feed';
import { createGithub, createGithubPublic } from '@deskorama/connector-github';
import { createLinear } from '@deskorama/connector-linear';
import { createPostHog } from '@deskorama/connector-posthog';
import { createSentry } from '@deskorama/connector-sentry';
import { createStripe } from '@deskorama/connector-stripe';
import { createVercel } from '@deskorama/connector-vercel';
import type { Connector } from '@deskorama/core';

/** Every Connector a person can add from the settings window: the dedicated services first, then the Feed. */
export const CONNECTORS: readonly Connector[] = [
  createGithub(),
  createGithubPublic(),
  createVercel(),
  createStripe(),
  createSentry(),
  createLinear(),
  createPostHog(),
  createFeed(),
];
