import type { Random } from '@deskorama/core';
import type { Drawn } from './demo-source.ts';
import { drawn } from './drawn.ts';
import { PLANS } from './kavelo-words.ts';
import { pick } from './pick.ts';

/**
 * Draws one of Kavelo's paying plans and its monthly price, for a renewal or, when `afterTrial`, a converted trial,
 * which adds a paying customer.
 * @example
 * drawPlan(random, false).text.en; // { detail: 'Pro plan, €49 a month', tag: '+€49' }
 * drawPlan(random, true).gauge; // { role: 'total', by: 1 }
 */
export function drawPlan(random: Random, afterTrial: boolean): Drawn {
  const { name, price } = pick(random, PLANS);
  const fr = `Plan ${name.fr}, ${price} € par mois${afterTrial ? ', après 14 jours d’essai' : ''}`;
  const en = `${name.en} plan, €${price} a month${afterTrial ? ', after a 14-day trial' : ''}`;

  return drawn([fr, `+${price} €`], [en, `+€${price}`], afterTrial ? { role: 'total', by: 1 } : undefined);
}
