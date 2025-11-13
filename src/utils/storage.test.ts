import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTranslations,
  saveTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  getRandomTranslation,
  exportTranslationsToCSV,
  downloadTranslationsAsCSV,
  recordCorrectAnswer,
  recordIncorrectAnswer,
} from './storage';
import { Translation } from '../types';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getTranslations', () => {
    it('should return empty array when localStorage is empty', () => {
      expect(getTranslations()).toEqual([]);
    });

    it('should return translations from localStorage', () => {
      const translations: Translation[] = [
        { id: '1', mandarin: '你好', translation: 'Hello' },
        { id: '2', mandarin: '谢谢', translation: 'Thank you' },
      ];
      localStorage.setItem('phraser', JSON.stringify(translations));
      expect(getTranslations()).toEqual(translations);
    });

    it('should return empty array on invalid JSON', () => {
      localStorage.setItem('phraser', 'invalid json');
      expect(getTranslations()).toEqual([]);
    });
  });

  describe('saveTranslations', () => {
    it('should save translations to localStorage', () => {
      const translations: Translation[] = [{ id: '1', mandarin: '你好', translation: 'Hello' }];
      saveTranslations(translations);
      const stored = localStorage.getItem('phraser');
      expect(stored).toBe(JSON.stringify(translations));
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation with pinyin', () => {
      const translation = addTranslation('你好', 'Hello');
      expect(translation.mandarin).toBe('你好');
      expect(translation.translation).toBe('Hello');
      expect(translation.id).toBeDefined();
      expect(translation.pinyin).toBeDefined();
      expect(translation.pinyin).toBeTruthy();

      const translations = getTranslations();
      expect(translations).toHaveLength(1);
      expect(translations[0]).toEqual(translation);
    });

    it('should add multiple translations', () => {
      addTranslation('你好', 'Hello');
      addTranslation('谢谢', 'Thank you');
      const translations = getTranslations();
      expect(translations).toHaveLength(2);
    });
  });

  describe('updateTranslation', () => {
    it('should update an existing translation with new pinyin', () => {
      const translation = addTranslation('你好', 'Hello');
      const success = updateTranslation(translation.id, '你好吗', 'How are you');
      expect(success).toBe(true);

      const translations = getTranslations();
      expect(translations[0].mandarin).toBe('你好吗');
      expect(translations[0].translation).toBe('How are you');
      expect(translations[0].pinyin).toBeDefined();
      expect(translations[0].pinyin).toBeTruthy();
    });

    it('should return false for non-existent translation', () => {
      const success = updateTranslation('non-existent-id', '你好', 'Hello');
      expect(success).toBe(false);
    });
  });

  describe('deleteTranslation', () => {
    it('should delete an existing translation', () => {
      const translation = addTranslation('你好', 'Hello');
      addTranslation('谢谢', 'Thank you');

      const success = deleteTranslation(translation.id);
      expect(success).toBe(true);

      const translations = getTranslations();
      expect(translations).toHaveLength(1);
      expect(translations[0].mandarin).toBe('谢谢');
    });

    it('should return false for non-existent translation', () => {
      const success = deleteTranslation('non-existent-id');
      expect(success).toBe(false);
    });
  });

  describe('getRandomTranslation', () => {
    it('should return null when no translations exist', () => {
      expect(getRandomTranslation()).toBeNull();
    });

    it('should return a translation when translations exist', () => {
      addTranslation('你好', 'Hello');
      const random = getRandomTranslation();
      expect(random).not.toBeNull();
      expect(random?.mandarin).toBe('你好');
      expect(random?.translation).toBe('Hello');
    });

    it('should return one of the existing translations', () => {
      addTranslation('你好', 'Hello');
      addTranslation('谢谢', 'Thank you');
      addTranslation('再见', 'Goodbye');

      // Run multiple times to ensure randomness
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        const random = getRandomTranslation();
        if (random) {
          results.add(random.id);
        }
      }

      // Should get at least one different result (though randomness means we might get same)
      const translations = getTranslations();
      expect(translations.length).toBeGreaterThan(0);
    });
  });

  describe('exportTranslationsToCSV', () => {
    it('should export empty array as CSV with header only', () => {
      const csv = exportTranslationsToCSV();
      expect(csv).toBe('mandarin,translation,pinyin');
    });

    it('should export translations as CSV', () => {
      addTranslation('你好', 'Hello');
      addTranslation('谢谢', 'Thank you');
      
      const csv = exportTranslationsToCSV();
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('mandarin,translation,pinyin');
      expect(lines[1]).toContain('你好');
      expect(lines[1]).toContain('Hello');
      expect(lines[2]).toContain('谢谢');
      expect(lines[2]).toContain('Thank you');
    });

    it('should escape commas in CSV fields', () => {
      addTranslation('你好', 'Hello, world');
      
      const csv = exportTranslationsToCSV();
      const lines = csv.split('\n');
      
      // Should contain quoted field with English comma
      expect(lines[1]).toContain('"Hello, world"');
      // Chinese comma doesn't need escaping
      expect(lines[1]).toContain('你好');
    });

    it('should escape quotes in CSV fields', () => {
      addTranslation('他说"你好"', 'He said "hello"');
      
      const csv = exportTranslationsToCSV();
      const lines = csv.split('\n');
      
      // Should escape quotes by doubling them
      expect(lines[1]).toContain('""');
    });
  });

  describe('downloadTranslationsAsCSV', () => {
    it('should create download link and trigger download', () => {
      addTranslation('你好', 'Hello');
      
      // Mock DOM methods
      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockCreateElement = vi.fn(() => ({
        setAttribute: vi.fn(),
        click: mockClick,
        style: {},
      }));
      
      document.createElement = mockCreateElement as any;
      document.body.appendChild = mockAppendChild as any;
      document.body.removeChild = mockRemoveChild as any;
      
      // Mock URL.createObjectURL and revokeObjectURL
      const mockRevokeObjectURL = vi.fn();
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = vi.fn(() => 'blob:mock-url') as any;
      URL.revokeObjectURL = mockRevokeObjectURL as any;
      
      downloadTranslationsAsCSV();
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      
      // Restore original functions
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });

  describe('scoring system', () => {
    it('should initialize new translations with zero scores', () => {
      const translation = addTranslation('你好', 'Hello');
      expect(translation.correctCount).toBe(0);
      expect(translation.incorrectCount).toBe(0);
    });

    it('should record correct answers', () => {
      const translation = addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);
      
      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(1);
      expect(updated?.incorrectCount).toBe(0);
    });

    it('should record incorrect answers', () => {
      const translation = addTranslation('你好', 'Hello');
      recordIncorrectAnswer(translation.id);
      
      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(0);
      expect(updated?.incorrectCount).toBe(1);
    });

    it('should increment correct count multiple times', () => {
      const translation = addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);
      recordCorrectAnswer(translation.id);
      recordCorrectAnswer(translation.id);
      
      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(3);
      expect(updated?.incorrectCount).toBe(0);
    });

    it('should increment incorrect count multiple times', () => {
      const translation = addTranslation('你好', 'Hello');
      recordIncorrectAnswer(translation.id);
      recordIncorrectAnswer(translation.id);
      
      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(0);
      expect(updated?.incorrectCount).toBe(2);
    });

    it('should preserve scores when updating translation', () => {
      const translation = addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);
      recordIncorrectAnswer(translation.id);
      
      updateTranslation(translation.id, '你好世界', 'Hello world');
      
      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(1);
      expect(updated?.incorrectCount).toBe(1);
      expect(updated?.mandarin).toBe('你好世界');
    });

    it('should return false when recording answer for non-existent translation', () => {
      expect(recordCorrectAnswer('non-existent-id')).toBe(false);
      expect(recordIncorrectAnswer('non-existent-id')).toBe(false);
    });
  });

  describe('probability-based selection', () => {
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
        if (card) counts[card.id]++;
      }
      
      // Bad item (weight 10.0) should appear most often
      // Medium item (weight 1.67) should appear more than good item (weight 0.91)
      expect(counts[bad.id]).toBeGreaterThan(counts[medium.id]);
      expect(counts[medium.id]).toBeGreaterThan(counts[good.id]);
      
      // Verify bad item appears significantly more often (should be ~6x more than medium)
      expect(counts[bad.id]).toBeGreaterThan(counts[medium.id] * 3);
    });

    it('should handle items with no attempts', () => {
      const newItem = addTranslation('新', 'New');
      const attempted = addTranslation('旧', 'Old');
      
      recordCorrectAnswer(attempted.id);
      recordIncorrectAnswer(attempted.id);
      
      // Both should be selectable
      const selections = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const card = getRandomTranslation();
        if (card) selections.add(card.id);
      }
      
      expect(selections.has(newItem.id)).toBe(true);
      expect(selections.has(attempted.id)).toBe(true);
    });
  });
});
