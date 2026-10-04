/** The step of a deploy Event, so a Theme never needs the Source's event kind to tell them apart. */
export type DeployStep = 'started' | 'succeeded' | 'failed';

/** Every deploy step, in the order a deploy goes through them. */
export const DEPLOY_STEPS: readonly DeployStep[] = ['started', 'succeeded', 'failed'];
