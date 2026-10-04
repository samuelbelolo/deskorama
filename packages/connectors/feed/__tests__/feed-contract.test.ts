import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createFeed } from '../src/create-feed.ts';
import { recordedPage, TRAMLO_FEED } from './tramlo-feed.ts';

describeConnectorContract({
  connector: createFeed(),
  settings: TRAMLO_FEED,
  recorded: () => () => recordedPage('first-page.json'),
  now: FIXTURE_TIME,
});
