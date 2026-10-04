import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createSentry } from '../src/create-sentry.ts';
import { recorded, TRAMLO_SENTRY } from './tramlo-sentry.ts';

describeConnectorContract({
  connector: createSentry(),
  settings: TRAMLO_SENTRY,
  recorded: () => () => recorded('issues-last-hour.json'),
  now: FIXTURE_TIME,
});
