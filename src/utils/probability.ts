/**
 * Probability and weight calculation utilities for translation selection
 */
import type { Translation } from '../types';

/**
 * Calculates success rate for a translation
 * Returns a value between 0 and 1
 */
export const calculateSuccessRate = (translation: Translation): number => {
  const correct = translation.correctCount ?? 0;
  const incorrect = translation.incorrectCount ?? 0;
  const total = correct + incorrect;

  if (total === 0) {
    // Items with no attempts get a default success rate of 0.5 (50%)
    return 0.5;
  }

  return correct / total;
};

/**
 * Calculates weight for probability-based selection
 * Lower success rates get higher weights (shown more often)
 * Formula: weight = 1 / (success_rate + 0.1)
 *
 * New items (no attempts) get maximum weight (10.0) to ensure they appear frequently
 *
 * Examples:
 * - New item (0 attempts) → weight = 10.0 (maximum)
 * - Success rate 0.0 (0%) → weight = 1 / (0.0 + 0.1) = 10.0
 * - Success rate 0.5 (50%) → weight = 1 / (0.5 + 0.1) = 1.67
 * - Success rate 1.0 (100%) → weight = 1 / (1.0 + 0.1) = 0.91
 */
export const calculateWeight = (translation: Translation): number => {
  const correct = translation.correctCount ?? 0;
  const incorrect = translation.incorrectCount ?? 0;
  const total = correct + incorrect;

  // New items with no attempts get maximum weight
  if (total === 0) {
    return 10.0;
  }

  const successRate = calculateSuccessRate(translation);
  return 1 / (successRate + 0.1);
};

/**
 * Selects a random translation using weighted probability
 * Items with lower success rates are shown more frequently
 */
export const selectRandomTranslation = (translations: Translation[]): Translation | null => {
  if (translations.length === 0) return null;

  // Pair each translation with its weight so the two can never drift apart.
  const weighted = translations.map(translation => ({
    translation,
    weight: calculateWeight(translation),
  }));

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);

  // Walk the cumulative distribution until the random draw is used up.
  let random = Math.random() * totalWeight;
  for (const entry of weighted) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.translation;
    }
  }

  // Only reachable through floating-point drift at the very top of the range.
  return weighted.at(-1)?.translation ?? null;
};
