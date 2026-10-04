import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createStripe } from '../src/create-stripe.ts';
import { KAVELO_STRIPE, recordedStripe } from './kavelo-stripe.ts';

describeConnectorContract({
  connector: createStripe(),
  settings: KAVELO_STRIPE,
  recorded: () => () => recordedStripe('events-page.json'),
  now: FIXTURE_TIME,
});
