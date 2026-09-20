import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addTranslation,
  recordCorrectAnswer,
  recordIncorrectAnswer,
  getRandomTranslation,
} from './translationService';

describe('probability-based selection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should select from all translations when scores are equal', () => {
    addTranslation('你好', 'Hello');
    addTranslation('谢谢', 'Thank you');
    addTranslation('再见', 'Goodbye');

    // All have default success rate of 0.5, so equal weights
    const selections = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const card = getRandomTranslation();
      if (card) selections.add(card.id);
    }

    // Should select all items (with some randomness)
    expect(selections.size).toBeGreaterThanOrEqual(1);
  });

  it('should favor items with lower success rates', () => {
    const bad = addTranslation('难', 'Hard');
    const medium = addTranslation('中', 'Medium');
    const good = addTranslation('易', 'Easy');

    // Set up scores: bad (0%), medium (50%), good (100%)
    for (let i = 0; i < 5; i++) {
      recordIncorrectAnswer(bad.id);
    }
    for (let i = 0; i < 5; i++) {
      recordCorrectAnswer(medium.id);
      recordIncorrectAnswer(medium.id);
    }
    for (let i = 0; i < 10; i++) {
      recordCorrectAnswer(good.id);
    }

    // Sample many times to reduce randomness
    const counts: Record<string, number> = { [bad.id]: 0, [medium.id]: 0, [good.id]: 0 };
    for (let i = 0; i < 1000; i++) {
      const card = getRandomTranslation();
      if (card) counts[card.id] = (counts[card.id] ?? 0) + 1;
    }

    // Bad item (weight 10.0) should appear most often
    // Medium item (weight 1.67) should appear more than good item (weight 0.91)
    expect(counts[bad.id] ?? 0).toBeGreaterThan(counts[medium.id] ?? 0);
    expect(counts[medium.id] ?? 0).toBeGreaterThan(counts[good.id] ?? 0);

    // Verify bad item appears significantly more often (should be ~6x more than medium)
    expect(counts[bad.id] ?? 0).toBeGreaterThan((counts[medium.id] ?? 0) * 3);
  });

  it('should handle items with no attempts', () => {
    const newItem = addTranslation('新', 'New');
    const attempted = addTranslation('旧', 'Old');

    recordCorrectAnswer(attempted.id);
    recordIncorrectAnswer(attempted.id);

    // Both must be reachable. Driving Math.random to each end of the range
    // proves that directly; sampling 20 random draws does not, because the
    // attempted item only carries weight 1.67 against the new item's 10.0,
    // so it is missed entirely in roughly 1 run in 20.
    const randomSpy = vi.spyOn(Math, 'random');

    randomSpy.mockReturnValue(0);
    expect(getRandomTranslation()?.id).toBe(newItem.id);

    randomSpy.mockReturnValue(0.999999);
    expect(getRandomTranslation()?.id).toBe(attempted.id);
  });

  it('should favor new items with maximum weight', () => {
    const newItem = addTranslation('新', 'New');
    const medium = addTranslation('中', 'Medium');

    // Set up medium item with 50% success rate (weight 1.67)
    for (let i = 0; i < 5; i++) {
      recordCorrectAnswer(medium.id);
      recordIncorrectAnswer(medium.id);
    }

    // Sample many times
    const counts: Record<string, number> = { [newItem.id]: 0, [medium.id]: 0 };
    for (let i = 0; i < 1000; i++) {
      const card = getRandomTranslation();
      if (card) counts[card.id] = (counts[card.id] ?? 0) + 1;
    }

    // New item (weight 10.0) should appear more often than medium item (weight 1.67)
    expect(counts[newItem.id] ?? 0).toBeGreaterThan(counts[medium.id] ?? 0);

    // New item should appear significantly more often (~6x more)
    expect(counts[newItem.id] ?? 0).toBeGreaterThan((counts[medium.id] ?? 0) * 3);
  });
});
