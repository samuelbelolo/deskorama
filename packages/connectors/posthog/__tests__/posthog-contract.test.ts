import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createPostHog } from '../src/create-posthog.ts';
import { KAVELO_POSTHOG, recordedPostHog } from './kavelo-posthog.ts';

describeConnectorContract({
  connector: createPostHog(),
  settings: KAVELO_POSTHOG,
  reports: 'gauges',
  recorded: () => () => recordedPostHog('counts.json'),
  now: FIXTURE_TIME,
});
