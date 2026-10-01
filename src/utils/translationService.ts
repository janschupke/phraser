/**
 * Business logic for translation operations
 * Separated from storage concerns
 */
import type { Translation } from '../types';
import { storageManager } from './storageManager';
import { generatePinyin } from './pinyin';
import { createId } from './id';
import { selectRandomTranslation } from './probability';

/**
 * Creates a new translation object with default values
 */
const createTranslation = async (mandarin: string, translation: string): Promise<Translation> => {
  return {
    id: createId(),
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin: await generatePinyin(mandarin.trim()),
    correctCount: 0,
    incorrectCount: 0,
  };
};

/**
 * Gets all translations from storage
 */
// A single frozen instance, so that "no translations yet" is referentially
// stable across reads -- a fresh [] each call would defeat useSyncExternalStore.
const NO_TRANSLATIONS: readonly Translation[] = Object.freeze([]);

export const getTranslations = (): Translation[] => {
  const stored = storageManager.get<Translation[]>(storageManager.getTranslationsKey());
  return stored ?? (NO_TRANSLATIONS as Translation[]);
};

/**
 * Saves translations to storage
 */
const saveTranslations = (translations: Translation[]): void => {
  storageManager.set(storageManager.getTranslationsKey(), translations);
};

// The writes below that need pinyin generate it before reading storage, so
// the read-modify-write stays synchronous: a write that lands while pinyin-pro
// is loading cannot be overwritten by a stale snapshot.

/**
 * Adds a new translation
 */
export const addTranslation = async (
  mandarin: string,
  translation: string
): Promise<Translation> => {
  const newTranslation = await createTranslation(mandarin, translation);
  saveTranslations([...getTranslations(), newTranslation]);
  return newTranslation;
};

/**
 * Updates an existing translation
 */
export const updateTranslation = async (
  id: string,
  mandarin: string,
  translation: string
): Promise<boolean> => {
  const pinyin = await generatePinyin(mandarin.trim());
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  const existing = translations[index];
  if (!existing) return false;

  const updated = [...translations];
  updated[index] = {
    id,
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin,
    correctCount: existing.correctCount ?? 0,
    incorrectCount: existing.incorrectCount ?? 0,
  };
  saveTranslations(updated);
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
export const addBatchTranslations = async (
  entries: { mandarin: string; translation: string }[]
): Promise<Translation[]> => {
  const newTranslations = await Promise.all(
    entries.map(({ mandarin, translation }) => createTranslation(mandarin, translation))
  );

  saveTranslations([...getTranslations(), ...newTranslations]);
  return newTranslations;
};

/**
 * Records a correct answer for a translation
 */
export const recordCorrectAnswer = (id: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  const existing = translations[index];
  if (!existing) return false;

  const updated = [...translations];
  updated[index] = {
    ...existing,
    correctCount: (existing.correctCount ?? 0) + 1,
  };
  saveTranslations(updated);
  return true;
};

/**
 * Records an incorrect answer for a translation
 */
export const recordIncorrectAnswer = (id: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  const existing = translations[index];
  if (!existing) return false;

  const updated = [...translations];
  updated[index] = {
    ...existing,
    incorrectCount: (existing.incorrectCount ?? 0) + 1,
  };
  saveTranslations(updated);
  return true;
};

/**
 * Resets all translations data
 * WARNING: This permanently deletes all translations and cannot be undone
 */
export const resetAllTranslations = (): void => {
  saveTranslations([]);
};

/**
 * Picks a translation at random, weighted so that cards you get wrong more
 * often come up more often.
 */
export const getRandomTranslation = (): Translation | null => {
  return selectRandomTranslation(getTranslations());
};
