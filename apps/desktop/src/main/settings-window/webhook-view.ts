import { LOCAL_WEBHOOK_ABOUT } from '@deskorama/connector-local-webhook/about';
import type { Language } from '@deskorama/core';
import type { WebhookView } from '../../shared/settings-snapshot.ts';
import type { WebhookControl } from '../create-webhook-control.ts';
import { webhookAddress } from '../webhook-address.ts';
import { webhookExample } from '../webhook-example.ts';
import { seenEvent } from './seen-event.ts';

/**
 * Returns the Local webhook as the settings window shows it, in the display language: whether it is on and
 * listening, its address, an example command that names the secret without showing it, and its latest Events.
 * @example
 * webhookView(webhook, 'fr').address; // 'http://127.0.0.1:47213/events'
 */
export function webhookView(webhook: WebhookControl, lang: Language): WebhookView {
  const { on, listening, port } = webhook.state();
  const address = webhookAddress(port);

  return {
    on,
    listening,
    address,
    example: webhookExample(address, null, lang),
    canRegenerate: webhook.canRegenerate,
    recent: webhook.recent().map((event) => seenEvent(event, lang)),
    about: LOCAL_WEBHOOK_ABOUT,
  };
}
