import type { Translation } from '../types';
import { normalizeForSearch } from './stringComparison';

/**
 * Filters translations by a free-text query.
 *
 * Matches mandarin, translation and pinyin, all normalized, so an accent-free
 * query finds accented pinyin ("ni hao" matches "nǐ hǎo"). Whitespace splits
 * the query into terms and every term must match somewhere in the row, which
 * makes a mixed query like "hello ni" behave the way people expect.
 *
 * No debounce: this runs over an in-memory array that localStorage caps in the
 * hundreds, so debouncing would only add input lag and a stale-state bug.
 * Revisit above a few thousand rows, and measure first.
 */
export function filterTranslations(translations: Translation[], query: string): Translation[] {
  const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return translations;

  return translations.filter(translation => {
    const haystack = [
      normalizeForSearch(translation.mandarin),
      normalizeForSearch(translation.translation),
      normalizeForSearch(translation.pinyin ?? ''),
    ];
    return terms.every(term => haystack.some(field => field.includes(term)));
  });
}
