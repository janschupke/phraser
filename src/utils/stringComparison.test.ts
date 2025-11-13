import { describe, it, expect } from 'vitest';
import { normalizeString, compareStrings, validateTranslation } from './stringComparison';

describe('stringComparison utilities', () => {
  describe('normalizeString', () => {
    it('should convert to lowercase', () => {
      expect(normalizeString('HELLO')).toBe('hello');
      expect(normalizeString('Hello')).toBe('hello');
    });

    it('should remove diacritics and accents', () => {
      expect(normalizeString('café')).toBe('cafe');
      expect(normalizeString('naïve')).toBe('naive');
      expect(normalizeString('résumé')).toBe('resume');
      expect(normalizeString('Zürich')).toBe('zurich');
    });

    it('should trim whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(normalizeString('')).toBe('');
    });
  });

  describe('compareStrings', () => {
    it('should compare strings ignoring case', () => {
      expect(compareStrings('Hello', 'hello')).toBe(true);
      expect(compareStrings('HELLO', 'hello')).toBe(true);
      expect(compareStrings('Hello', 'HELLO')).toBe(true);
    });

    it('should compare strings ignoring accents', () => {
      expect(compareStrings('café', 'cafe')).toBe(true);
      expect(compareStrings('naïve', 'naive')).toBe(true);
      expect(compareStrings('résumé', 'resume')).toBe(true);
    });

    it('should compare strings ignoring both case and accents', () => {
      expect(compareStrings('Café', 'CAFE')).toBe(true);
      expect(compareStrings('RÉSUMÉ', 'resume')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(compareStrings('hello', 'world')).toBe(false);
      expect(compareStrings('cafe', 'coffee')).toBe(false);
    });

    it('should handle whitespace differences', () => {
      expect(compareStrings('hello', ' hello ')).toBe(true);
    });
  });

  describe('validateTranslation', () => {
    it('should return true for correct translations', () => {
      expect(validateTranslation('Hello', 'Hello')).toBe(true);
      expect(validateTranslation('hello', 'Hello')).toBe(true);
      expect(validateTranslation('HELLO', 'Hello')).toBe(true);
      expect(validateTranslation('café', 'cafe')).toBe(true);
      expect(validateTranslation('  hello  ', 'Hello')).toBe(true);
    });

    it('should return false for incorrect translations', () => {
      expect(validateTranslation('Hello', 'World')).toBe(false);
      expect(validateTranslation('hello', 'goodbye')).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(validateTranslation('', 'Hello')).toBe(false);
      expect(validateTranslation('   ', 'Hello')).toBe(false);
      expect(validateTranslation('\t\n', 'Hello')).toBe(false);
    });

    it('should handle special characters and ignore punctuation', () => {
      expect(validateTranslation("don't", "don't")).toBe(true);
      expect(validateTranslation("DON'T", "don't")).toBe(true);
      expect(validateTranslation('hello-world', 'hello-world')).toBe(true);
      expect(validateTranslation('HELLO-WORLD', 'hello-world')).toBe(true);
      // Punctuation is ignored, so "don't" == "dont"
      expect(validateTranslation("don't", "dont")).toBe(true);
      expect(validateTranslation("don't", "Don't")).toBe(true);
      expect(validateTranslation("hello, world!", "hello world")).toBe(true);
      expect(validateTranslation("Hello.", "hello")).toBe(true);
    });
  });
});
