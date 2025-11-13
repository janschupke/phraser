import { Translation } from '../types';
import { pinyin } from 'pinyin-pro';

const STORAGE_KEY = 'phraser';

const generatePinyin = (mandarin: string): string => {
  try {
    return pinyin(mandarin, { toneType: 'symbol' });
  } catch {
    return '';
  }
};

export const getTranslations = (): Translation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveTranslations = (translations: Translation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addTranslation = (mandarin: string, translation: string): Translation => {
  const translations = getTranslations();
  const newTranslation: Translation = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    mandarin,
    translation,
    pinyin: generatePinyin(mandarin),
  };
  translations.push(newTranslation);
  saveTranslations(translations);
  return newTranslation;
};

export const updateTranslation = (id: string, mandarin: string, translation: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  translations[index] = { id, mandarin, translation, pinyin: generatePinyin(mandarin) };
  saveTranslations(translations);
  return true;
};

export const deleteTranslation = (id: string): boolean => {
  const translations = getTranslations();
  const filtered = translations.filter(t => t.id !== id);
  if (filtered.length === translations.length) return false;

  saveTranslations(filtered);
  return true;
};

export const getRandomTranslation = (): Translation | null => {
  const translations = getTranslations();
  if (translations.length === 0) return null;
  return translations[Math.floor(Math.random() * translations.length)];
};

export const addBatchTranslations = (translations: Array<{ mandarin: string; translation: string }>): Translation[] => {
  const existingTranslations = getTranslations();
  const newTranslations: Translation[] = translations.map(({ mandarin, translation }) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin: generatePinyin(mandarin.trim()),
  }));
  
  existingTranslations.push(...newTranslations);
  saveTranslations(existingTranslations);
  return newTranslations;
};
