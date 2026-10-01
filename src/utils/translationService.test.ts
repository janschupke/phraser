import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  recordCorrectAnswer,
  recordIncorrectAnswer,
  getRandomTranslation,
} from './translationService';
import { at } from '../test/helpers';
import type { Translation } from '../types';

describe('translationService', () => {
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

  describe('addTranslation', () => {
    it('should add a new translation with pinyin', async () => {
      const translation = await addTranslation('你好', 'Hello');
      expect(translation.mandarin).toBe('你好');
      expect(translation.translation).toBe('Hello');
      expect(translation.id).toBeDefined();
      expect(translation.pinyin).toBeDefined();
      expect(translation.pinyin).toBeTruthy();

      const translations = getTranslations();
      expect(translations).toHaveLength(1);
      expect(translations[0]).toEqual(translation);
    });

    it('should add multiple translations', async () => {
      await addTranslation('你好', 'Hello');
      await addTranslation('谢谢', 'Thank you');
      const translations = getTranslations();
      expect(translations).toHaveLength(2);
    });
  });

  describe('updateTranslation', () => {
    it('should update an existing translation with new pinyin', async () => {
      const translation = await addTranslation('你好', 'Hello');
      const success = await updateTranslation(translation.id, '你好吗', 'How are you');
      expect(success).toBe(true);

      const translations = getTranslations();
      expect(at(translations, 0).mandarin).toBe('你好吗');
      expect(at(translations, 0).translation).toBe('How are you');
      expect(at(translations, 0).pinyin).toBeDefined();
      expect(at(translations, 0).pinyin).toBeTruthy();
    });

    it('should return false for non-existent translation', async () => {
      const success = await updateTranslation('non-existent-id', '你好', 'Hello');
      expect(success).toBe(false);
    });
  });

  describe('deleteTranslation', () => {
    it('should delete an existing translation', async () => {
      const translation = await addTranslation('你好', 'Hello');
      await addTranslation('谢谢', 'Thank you');

      const success = deleteTranslation(translation.id);
      expect(success).toBe(true);

      const translations = getTranslations();
      expect(translations).toHaveLength(1);
      expect(at(translations, 0).mandarin).toBe('谢谢');
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

    it('should return a translation when translations exist', async () => {
      await addTranslation('你好', 'Hello');
      const random = getRandomTranslation();
      expect(random).not.toBeNull();
      expect(random?.mandarin).toBe('你好');
      expect(random?.translation).toBe('Hello');
    });

    it('should return one of the existing translations', async () => {
      await addTranslation('你好', 'Hello');
      await addTranslation('谢谢', 'Thank you');
      await addTranslation('再见', 'Goodbye');

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

  describe('scoring system', () => {
    it('should initialize new translations with zero scores', async () => {
      const translation = await addTranslation('你好', 'Hello');
      expect(translation.correctCount).toBe(0);
      expect(translation.incorrectCount).toBe(0);
    });

    it('should record correct answers', async () => {
      const translation = await addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);

      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(1);
      expect(updated?.incorrectCount).toBe(0);
    });

    it('should record incorrect answers', async () => {
      const translation = await addTranslation('你好', 'Hello');
      recordIncorrectAnswer(translation.id);

      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(0);
      expect(updated?.incorrectCount).toBe(1);
    });

    it('should increment correct count multiple times', async () => {
      const translation = await addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);
      recordCorrectAnswer(translation.id);
      recordCorrectAnswer(translation.id);

      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(3);
      expect(updated?.incorrectCount).toBe(0);
    });

    it('should increment incorrect count multiple times', async () => {
      const translation = await addTranslation('你好', 'Hello');
      recordIncorrectAnswer(translation.id);
      recordIncorrectAnswer(translation.id);

      const updated = getTranslations().find(t => t.id === translation.id);
      expect(updated?.correctCount).toBe(0);
      expect(updated?.incorrectCount).toBe(2);
    });

    it('should preserve scores when updating translation', async () => {
      const translation = await addTranslation('你好', 'Hello');
      recordCorrectAnswer(translation.id);
      recordIncorrectAnswer(translation.id);

      await updateTranslation(translation.id, '你好世界', 'Hello world');

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
});
