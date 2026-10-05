import {
  createListeners,
  GAUGE_ROLES,
  type Cancel,
  type Connector,
  type GaugeValues,
  type Language,
  type SourceEvent,
  type SourceProfile,
} from '@deskorama/core';
import type { Preferences, PreferencesChange } from '../../shared/preferences.ts';
import type { Scene } from '../../shared/scene.ts';
import { displayLanguage } from '../display-language.ts';
import type { SourceEntry } from '../sources/source-entry.ts';
import type { WallpaperStage } from '../wallpapers/create-wallpaper-stage.ts';
import { applyPreferences } from './apply-preferences.ts';
import { createGaugeRelay } from './create-gauge-relay.ts';
import { sceneOf } from './scene-of.ts';
import { sceneSources, type SceneSources } from './scene-sources.ts';

/** What the scene is made of when the app starts, and where its changes go. */
export interface SceneControlOptions {
  readonly connectors: readonly Connector[];
  /** Names the scene while no Source is connected. */
  readonly fallback: SourceProfile;
  /** The Mac's preferred languages, most preferred first. */
  readonly systemLanguages: readonly string[];
  readonly preferences: Preferences;
  readonly sources: readonly SourceEntry[];
  /** Keeps the preferences in `settings.json`; a failure is thrown back and nothing changes. */
  readonly savePreferences: (preferences: Preferences) => void;
  /** The wallpapers, which redraw on a new scene, show new Gauge values and freeze. */
  readonly wallpapers: Pick<WallpaperStage, 'setScene' | 'setGauges' | 'setPaused'>;
}

/** The scene every wallpaper draws, and what changes it. */
export interface SceneControl {
  readonly scene: () => Scene;
  /** The display language: the Mac's own unless the person picked one. */
  readonly lang: () => Language;
  readonly preferences: () => Preferences;
  /** The Sources that name the scene and feed its Gauges now. */
  readonly sources: () => SceneSources;
  readonly paused: () => boolean;
  /** Saves a change of Theme, language, brand or Gauge Sources, and redraws every wallpaper with it. */
  setPreferences(change: PreferencesChange): void;
  /** Freezes every wallpaper, or lets it play again; a pause is not kept across launches. */
  setPaused(paused: boolean): void;
  /** Follows the connected Sources, after the person adds, edits or removes one. */
  setSources(entries: readonly SourceEntry[]): void;
  /** Shows the Gauge values a Source reported, for the roles it feeds. */
  setGauges(sourceId: string, values: Partial<GaugeValues>): void;
  /** Returns an Event of a Source (null for the Local webhook) as the wallpapers get it; see `GaugeRelay.event`. */
  fromSource(sourceId: string | null, event: SourceEvent): SourceEvent;
  /** Shows where production stands again, after a test deploy pretended otherwise. */
  restoreBuild(): void;
  /** Calls `listener` whenever the preferences, the pause or the Sources change, until cancelled. */
  onChange(listener: () => void): Cancel;
}

/**
 * Returns the control of the scene: it works out the scene from the preferences and the connected Sources, hands it
 * to the wallpapers whenever it changes, and hands them the Gauge values again whenever the scene or the Source of
 * a Gauge changes, since a scene that starts over in a new language starts its Gauges over.
 * @example
 * const scene = createSceneControl({ connectors: CONNECTORS, fallback: LOCAL_WEBHOOK_PROFILE,
 *   systemLanguages: app.getPreferredSystemLanguages(), preferences, sources, savePreferences, wallpapers });
 * scene.setPreferences({ language: 'en' }); // every wallpaper redraws in English
 * scene.setPaused(true); // every wallpaper freezes
 */
export function createSceneControl(options: SceneControlOptions): SceneControl {
  const listeners = createListeners<void>();
  const relay = createGaugeRelay();

  let preferences = options.preferences;
  let entries = options.sources;
  let paused = false;

  const lang = (): Language =>
    preferences.language === 'system' ? displayLanguage(options.systemLanguages) : preferences.language;

  const sources = (): SceneSources => sceneSources(preferences, entries, options.connectors);

  const scene = (): Scene => sceneOf(preferences.theme, lang(), sources(), options.fallback);

  /** Which Source feeds each Gauge: two Sources of one Connector word their Gauges alike, so the scene hides it. */
  const feeders = (): string => JSON.stringify(GAUGE_ROLES.map((role) => sources()[role]?.entry.id ?? null));

  const sendGauges = (values: Partial<GaugeValues>): void => {
    if (Object.keys(values).length > 0) options.wallpapers.setGauges(values);
  };

  let sentScene = JSON.stringify(scene());
  let sentFeeders = feeders();

  /** Hands on the scene if it changed, the Gauges if the scene or their Sources changed, then tells every listener. */
  const changed = (): void => {
    const next = scene();
    const json = JSON.stringify(next);
    const nextFeeders = feeders();

    if (json !== sentScene) options.wallpapers.setScene(next);

    if (json !== sentScene || nextFeeders !== sentFeeders) sendGauges(relay.current(sources()));

    sentScene = json;
    sentFeeders = nextFeeders;

    listeners.emit();
  };

  return {
    scene,
    lang,
    preferences: () => preferences,
    sources,
    paused: () => paused,

    setPreferences(change) {
      const next = applyPreferences(preferences, change);

      if (JSON.stringify(next) === JSON.stringify(preferences)) return;

      options.savePreferences(next);
      preferences = next;

      changed();
    },

    setPaused(next) {
      if (next === paused) return;

      paused = next;
      options.wallpapers.setPaused(paused);

      listeners.emit();
    },

    setSources(next) {
      if (JSON.stringify(next) === JSON.stringify(entries)) return;

      entries = next;
      relay.keep(entries.map((entry) => entry.id));

      changed();
    },

    setGauges: (sourceId, values) => sendGauges(relay.report(sourceId, values, sources())),

    fromSource: (sourceId, event) => relay.event(sourceId, event, sources()),

    restoreBuild: () => options.wallpapers.setGauges({ build: relay.build() }),

    onChange: (listener) => listeners.add(listener),
  };
}
