import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createLinear } from '../src/create-linear.ts';
import { recorded, TRAMLO_LINEAR } from './tramlo-linear.ts';

describeConnectorContract({
  connector: createLinear(),
  settings: TRAMLO_LINEAR,
  recorded: () => () => recorded('issues-last-hour.json'),
  now: FIXTURE_TIME,
});
