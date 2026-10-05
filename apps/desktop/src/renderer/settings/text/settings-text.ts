import type { GaugeRole } from '@deskorama/core';
import type { PaneId } from '../pane-id.ts';
import type { RoleGroupId } from '../try/role-groups.ts';

/** The words of the settings window. A Connector's and a Theme's own words come from their packages, not from here. */
export interface SettingsText {
  readonly windowTitle: string;
  readonly panes: Readonly<Record<PaneId, string>>;
  readonly back: string;
  readonly forward: string;
  /** How many Sources the Mac reads, under the sidebar. */
  readonly reading: (count: number) => string;

  readonly emptyTitle: string;
  readonly emptyLead: string;
  readonly emptyScript: string;
  readonly emptyScriptLink: string;
  readonly connected: string;
  readonly addSource: string;
  /** The name a catalogue tile is announced with. */
  readonly connect: (service: string) => string;
  /** A Source's service and where it reads, e.g. its repository. */
  readonly where: (service: string, place: string) => string;
  readonly waiting: string;
  readonly readAt: (time: string) => string;
  readonly lastEvent: (what: string, when: string) => string;
  readonly edit: string;
  readonly remove: string;
  readonly more: (name: string) => string;
  readonly fixToken: string;
  readonly fixPermission: string;
  readonly removeTitle: (name: string) => string;
  readonly removeBody: string;

  readonly sheetName: string;
  readonly namePlaceholder: string;
  readonly sheetToken: string;
  readonly keepToken: string;
  readonly sheetCreate: string;
  readonly sheetOpen: (site: string) => string;
  readonly sheetTick: string;
  readonly sheetPaste: string;
  readonly sheetKeychain: string;
  /** The title of the step where what the token can see is picked from lists. */
  readonly sheetChoose: string;
  /** Said in place of a list that waits for the token. */
  readonly pickNeedsToken: string;
  /** Said in place of a list that waits for another field, named by its label. */
  readonly pickNeeds: (label: string) => string;
  readonly pickLoading: string;
  /** Said when the service listed nothing, above the field to type in. */
  readonly pickEmpty: string;
  /** How to type several values in one field. */
  readonly pickSeveral: string;
  /** The first line of a pop-up button nothing is chosen in yet. */
  readonly pickChoose: string;
  /** The name of the field that narrows a long list, given the list's label. */
  readonly pickFilter: (label: string) => string;
  /** What that field shows while it is empty. */
  readonly pickFilterPlaceholder: string;
  /** The name of the line under a loaded list where a value it lacks is typed, given the list's label. */
  readonly pickUnlisted: (label: string) => string;
  /** What that line shows while it is empty. */
  readonly pickUnlistedPlaceholder: string;
  /** Said under a list none of which is ticked, when one at least is needed. */
  readonly pickAtLeastOne: string;
  readonly sheetEvery: string;
  readonly seconds: string;
  readonly sheetBounds: (min: string, max: string) => string;
  readonly sheetTestTitle: string;
  readonly sheetTest: string;
  readonly sheetRetest: string;
  readonly sheetTesting: string;
  /** What a test says once the service answered with `count` Events, at least one. */
  readonly sheetFound: (where: string, count: number) => string;
  /** What a test says once the service answered with Gauge values and no Event. */
  readonly sheetCounts: (where: string) => string;
  readonly sheetNoEvent: (where: string) => string;
  readonly sheetPlaysAs: (time: string, role: string) => string;
  readonly sheetNothingSaved: string;
  readonly sheetFix: string;
  readonly sheetFailed: string;
  readonly cancel: string;
  readonly save: string;

  readonly themes: string;
  readonly themeNow: string;
  readonly dayNight: string;
  readonly day: string;
  readonly night: string;
  readonly general: string;
  readonly language: string;
  /** The choice of the Mac's own language, naming which one that is. */
  readonly macLanguage: (name: string) => string;
  readonly openAtLogin: string;
  readonly needsApproval: string;
  readonly scene: string;
  readonly sceneNote: string;
  readonly brand: string;
  readonly gaugeNames: Readonly<Record<GaugeRole, string>>;
  /** The choice of a Gauge that follows the Source naming the scene. */
  readonly sameAsScene: (name: string) => string;

  readonly tryLead: string;
  readonly playsOn: string;
  readonly play: (name: string) => string;
  readonly played: (name: string, theme: string) => string;
  readonly rare: string;
  readonly jackpotLead: string;
  readonly roleGroups: Readonly<Record<RoleGroupId, string>>;

  readonly webhookOn: string;
  readonly portTaken: (address: string) => string;
  readonly access: string;
  readonly address: string;
  readonly secret: string;
  readonly show: string;
  readonly hide: string;
  readonly copy: string;
  readonly regenerate: string;
  readonly regenerateTitle: string;
  readonly regenerateBody: string;
  readonly regenerateConfirm: string;
  /** Said when the new secret could not be kept, so the old one is still the one scripts must send. */
  readonly regenerateFailed: string;
  readonly example: string;
  readonly exampleNote: string;
  readonly received: string;
  readonly noneReceived: string;
}
