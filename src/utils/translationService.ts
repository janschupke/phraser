/**
 * Business logic for translation operations
 * Separated from storage concerns
 */
import { Translation } from '../types';
import { storageManager } from './storageManager';
import { generatePinyin } from './pinyin';

/**
 * Generates a unique ID for a translation
 */
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Creates a new translation object with default values
 */
const createTranslation = (mandarin: string, translation: string): Translation => {
  return {
    id: generateId(),
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin: generatePinyin(mandarin.trim()),
    correctCount: 0,
    incorrectCount: 0,
  };
};

/**
 * Gets all translations from storage
 */
export const getTranslations = (): Translation[] => {
  const stored = storageManager.get<Translation[]>(storageManager.getTranslationsKey());
  return stored || [];
};

/**
 * Saves translations to storage
 */
const saveTranslations = (translations: Translation[]): void => {
  storageManager.set(storageManager.getTranslationsKey(), translations);
};

/**
 * Adds a new translation
 */
export const addTranslation = (mandarin: string, translation: string): Translation => {
  const translations = getTranslations();
  const newTranslation = createTranslation(mandarin, translation);
  translations.push(newTranslation);
  saveTranslations(translations);
  return newTranslation;
};

/**
 * Updates an existing translation
 */
export const updateTranslation = (id: string, mandarin: string, translation: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  const existing = translations[index];
  translations[index] = {
    id,
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin: generatePinyin(mandarin.trim()),
    correctCount: existing.correctCount ?? 0,
    incorrectCount: existing.incorrectCount ?? 0,
  };
  saveTranslations(translations);
  return true;
};

/**
 * Deletes a translation
 */
export const deleteTranslation = (id: string): boolean => {
  const translations = getTranslations();
  const filtered = translations.filter(t => t.id !== id);
  if (filtered.length === translations.length) return false;

  saveTranslations(filtered);
  return true;
};

/**
 * Adds multiple translations in batch
 */
export const addBatchTranslations = (
  entries: Array<{ mandarin: string; translation: string }>
): Translation[] => {
  const existingTranslations = getTranslations();
  const newTranslations: Translation[] = entries.map(({ mandarin, translation }) =>
    createTranslation(mandarin, translation)
  );

  existingTranslations.push(...newTranslations);
  saveTranslations(existingTranslations);
  return newTranslations;
};

/**
 * Records a correct answer for a translation
 */
export const recordCorrectAnswer = (id: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  translations[index] = {
    ...translations[index],
    correctCount: (translations[index].correctCount ?? 0) + 1,
  };
  saveTranslations(translations);
  return true;
};

/**
 * Records an incorrect answer for a translation
 */
export const recordIncorrectAnswer = (id: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  translations[index] = {
    ...translations[index],
    incorrectCount: (translations[index].incorrectCount ?? 0) + 1,
  };
  saveTranslations(translations);
  return true;
};

/**
 * Resets all translations data
 * WARNING: This permanently deletes all translations and cannot be undone
 */
export const resetAllTranslations = (): void => {
  saveTranslations([]);
};
