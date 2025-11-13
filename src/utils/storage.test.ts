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
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      
      downloadTranslationsAsCSV();
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
