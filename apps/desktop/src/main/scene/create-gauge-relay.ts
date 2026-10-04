import type { BuildState, DeployStep, GaugeValues, SourceEvent } from '@deskorama/core';
import { composeGauges } from './compose-gauges.ts';
import type { SceneSources } from './scene-sources.ts';

/** The build state each deploy step leaves production in, as the engine sets it. */
const BUILD_AFTER: Readonly<Record<DeployStep, BuildState>> = {
  started: 'building',
  succeeded: 'ready',
  failed: 'error',
};

/** What passes the Sources' Gauge values and Events on to the wallpapers, for the Gauges each Source feeds. */
export interface GaugeRelay {
  /** Keeps a Source's report and returns what to show of it: the roles that Source feeds, and the build state. */
  report(sourceId: string, values: Partial<GaugeValues>, sources: SceneSources): Partial<GaugeValues>;
  /**
   * Returns an Event as the wallpapers get it: its Gauge move kept only when its Source feeds that Gauge, the
   * Local webhook (no Source id) feeding them only while no Source is connected. Keeps the build state of a deploy.
   */
  event(sourceId: string | null, event: SourceEvent, sources: SceneSources): SourceEvent;
  /** The values to show on a scene that starts over: each Gauge's latest from its Source, and the build state. */
  current(sources: SceneSources): Partial<GaugeValues>;
  /** Where production stands as the Sources last said, idle when none has. */
  build(): BuildState;
  /** Forgets the reports of the Sources that are no longer connected. */
  keep(sourceIds: readonly string[]): void;
}

/**
 * Returns an empty Gauge relay. The build state is production's, whatever Source reports it, so it always passes.
 * @example
 * const relay = createGaugeRelay();
 * relay.report('src-2', { daily: 3, build: 'ready' }, sources); // { daily: 3, build: 'ready' } when src-2 feeds daily
 * relay.event('src-1', paidEvent, sources).gauge; // undefined when src-1 does not feed the Gauge it moves
 */
export function createGaugeRelay(): GaugeRelay {
  // The latest values each Source reported, so a Gauge that changes Source shows the new one's at once.
  const latest = new Map<string, Partial<GaugeValues>>();

  let build: BuildState | undefined;

  const withBuild = (values: Partial<GaugeValues>): Partial<GaugeValues> =>
    build === undefined ? values : { ...values, build };

  return {
    report(sourceId, values, sources) {
      latest.set(sourceId, { ...latest.get(sourceId), ...values });

      if (values.build !== undefined) build = values.build;

      const fed = composeGauges(new Map([[sourceId, values]]), sources);

      return values.build === undefined ? fed : { ...fed, build: values.build };
    },

    event(sourceId, event, sources) {
      if (event.step !== undefined) build = BUILD_AFTER[event.step];

      if (event.gauge === undefined) return event;

      const feeder = sources[event.gauge.role]?.entry.id ?? null;

      if (feeder === sourceId) return event;

      const { gauge: _moved, ...unmoved } = event;

      return unmoved;
    },

    current: (sources) => withBuild(composeGauges(latest, sources)),

    build: () => build ?? 'idle',

    keep(sourceIds) {
      for (const id of latest.keys()) if (!sourceIds.includes(id)) latest.delete(id);
    },
  };
}
