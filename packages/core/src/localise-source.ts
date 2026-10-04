import type { Language } from './language.ts';
import type { SourceInfo } from './source-info.ts';
import type { SourceProfile } from './source-profile.ts';

/**
 * Returns what a Theme knows of a Source: its name and the words of its Gauges in one display language.
 * @example
 * const info = localiseSource(tramlo, 'en');
 * info.gauges.daily.short; // "COMMITS"
 * info.gauges.crowd.max; // 14
 */
export function localiseSource(profile: SourceProfile, lang: Language): SourceInfo {
  const { crowd, daily, total } = profile.gauges;
  return {
    name: profile.name,
    gauges: { crowd: { ...crowd.text[lang], max: crowd.max }, daily: daily.text[lang], total: total.text[lang] },
  };
}
