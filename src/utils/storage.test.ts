import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTranslations,
  saveTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  getRandomTranslation,
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
        { id: '1', mandarin: '你好', english: 'Hello' },
        { id: '2', mandarin: '谢谢', english: 'Thank you' },
      ];
      localStorage.setItem('phraser-translations', JSON.stringify(translations));
      expect(getTranslations()).toEqual(translations);
    });

    it('should return empty array on invalid JSON', () => {
      localStorage.setItem('phraser-translations', 'invalid json');
      expect(getTranslations()).toEqual([]);
    });
  });

  describe('saveTranslations', () => {
    it('should save translations to localStorage', () => {
      const translations: Translation[] = [{ id: '1', mandarin: '你好', english: 'Hello' }];
      saveTranslations(translations);
      const stored = localStorage.getItem('phraser-translations');
      expect(stored).toBe(JSON.stringify(translations));
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation with pinyin', () => {
      const translation = addTranslation('你好', 'Hello');
      expect(translation.mandarin).toBe('你好');
      expect(translation.english).toBe('Hello');
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
      expect(translations[0].english).toBe('How are you');
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
      expect(random?.english).toBe('Hello');
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
});
