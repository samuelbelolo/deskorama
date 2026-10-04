import type { ElectronApplication } from '@playwright/test';

/**
 * Returns the CPU the whole app used over `ms` milliseconds, summed over all its processes, in percent of one core.
 * Electron measures each process's usage since the previous call, so the first call only starts the window.
 * @example
 * await sampleCpu(app, 3000); // 0.4
 */
export async function sampleCpu(app: ElectronApplication, ms: number): Promise<number> {
  const measure = (): Promise<number> =>
    app.evaluate(({ app: electronApp }) =>
      electronApp.getAppMetrics().reduce((sum, process) => sum + process.cpu.percentCPUUsage, 0),
    );
  await measure();
  await new Promise((resolve) => setTimeout(resolve, ms));
  return measure();
}
