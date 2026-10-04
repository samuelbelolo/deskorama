import { describeConnectorContract, FIXTURE_TIME } from '@deskorama/test-utils';
import { createGithubPublic } from '../src/create-github-public.ts';
import { createGithub } from '../src/create-github.ts';
import { answerFrom } from './answer-from.ts';
import { firstPollOfApp, TRAMLO_APP, TRAMLO_APP_REPOSITORY } from './tramlo-app.ts';
import { pollOfKit, TRAMLO_KIT, TRAMLO_KIT_REPOSITORY } from './tramlo-kit.ts';

describeConnectorContract({
  connector: createGithub(),
  settings: TRAMLO_APP,
  recorded: () => answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()),
  now: FIXTURE_TIME,
});

describeConnectorContract({
  connector: createGithubPublic(),
  settings: TRAMLO_KIT,
  recorded: () => answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit()),
  now: FIXTURE_TIME,
});
