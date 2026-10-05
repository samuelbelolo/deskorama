import type { Connector } from '@deskorama/core';
import type { ConnectorView } from '../../shared/settings-snapshot.ts';

/**
 * Returns a Connector as the settings window shows it: what it says of itself, what a person fills in, and what
 * its Sources count. Everything but `poll`, which stays in the main process.
 * @example
 * connectorView(createStripe()).about.pitch.en; // 'Payments received and declined, new subscriptions.'
 */
export function connectorView(connector: Connector): ConnectorView {
  const { id, title, about, config, gauges } = connector;

  return {
    id,
    title,
    about,
    fields: config.fields,
    permissions: config.permissions,
    interval: config.interval,
    gauges,
  };
}
