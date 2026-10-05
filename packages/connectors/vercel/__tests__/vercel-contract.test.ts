import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createVercel } from '../src/create-vercel.ts';
import { recorded, TRAMLO_VERCEL } from './tramlo-vercel.ts';

describeConnectorContract({
  connector: createVercel(),
  settings: TRAMLO_VERCEL,
  recorded: () => () => recorded('deployments-last-hour.json'),
  options: [{ field: 'projects', recorded: () => () => recorded('projects.json') }],
  now: FIXTURE_TIME,
});
