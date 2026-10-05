import { countedWords, pickedValues, type ConnectorField, type Language } from '@deskorama/core';
import { choiceOf } from '../../../shared/choice-of.ts';
import type { ConnectorView, SourceView } from '../../../shared/settings-snapshot.ts';

/**
 * Returns where a connected Source reads, in a few words: what its first field holds (the name of a fixed choice,
 * the value of a typed or picked one), then how many each field that holds several follows, in the Connector's own
 * words. Empty for a Source whose Connector asks for no field.
 * @example
 * sourcePlace(tramloSentry, sentry, 'en'); // 'tramlo, 2 projects, 1 environment'
 * sourcePlace(kaveloPostHog, posthog, 'fr'); // 'Cloud EU, 2 événements d’inscription'
 */
export function sourcePlace(source: SourceView, connector: ConnectorView, lang: Language): string {
  const said = connector.fields.flatMap((field, index) => {
    if (field.kind === 'pick-many') {
      const words = countWords(field, source, lang);

      return words === null ? [] : [words];
    }

    return index === 0 ? [oneValue(field, source, lang)] : [];
  });

  return said.filter((words) => words !== '').join(', ');
}

/**
 * Returns how many values a Source holds for a field that takes several, in the Connector's own words, or null
 * when it holds none.
 * @example
 * countWords(projects, { …, lists: { projects: ['prj_web', 'prj_api', 'prj_docs'] } }, 'en'); // '3 projects'
 */
function countWords(
  field: Extract<ConnectorField, { readonly kind: 'pick-many' }>,
  source: SourceView,
  lang: Language,
): string | null {
  const count = pickedValues(source, field.key, field.formerly).length;

  return count === 0 ? null : countedWords(field.counted[lang], count);
}

/**
 * Returns what a Source holds for a field that takes one value, as a person reads it: the name of the choice it
 * stands for, or the value itself.
 * @example
 * oneValue(cloud, { …, values: { host: 'https://eu.posthog.com/' } }, 'en'); // 'EU Cloud'
 */
function oneValue(
  field: Exclude<ConnectorField, { readonly kind: 'pick-many' }>,
  source: SourceView,
  lang: Language,
): string {
  const value = (source.values[field.key] ?? '').trim();

  if (field.kind !== 'choice') return value;

  return choiceOf(field, value)?.label[lang] ?? value;
}
