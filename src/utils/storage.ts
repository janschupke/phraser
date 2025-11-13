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
    correctCount: 0,
    incorrectCount: 0,
  };
  translations.push(newTranslation);
  saveTranslations(translations);
  return newTranslation;
};

export const updateTranslation = (id: string, mandarin: string, translation: string): boolean => {
  const translations = getTranslations();
  const index = translations.findIndex(t => t.id === id);
  if (index === -1) return false;

  const existing = translations[index];
  translations[index] = { 
    id, 
    mandarin, 
    translation, 
    pinyin: generatePinyin(mandarin),
    correctCount: existing.correctCount ?? 0,
    incorrectCount: existing.incorrectCount ?? 0,
  };
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
 * Calculates success rate for a translation
 * Returns a value between 0 and 1
 */
const calculateSuccessRate = (translation: Translation): number => {
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
 * Examples:
 * - Success rate 0.0 (0%) → weight = 1 / (0.0 + 0.1) = 10.0
 * - Success rate 0.5 (50%) → weight = 1 / (0.5 + 0.1) = 1.67
 * - Success rate 1.0 (100%) → weight = 1 / (1.0 + 0.1) = 0.91
 */
const calculateWeight = (translation: Translation): number => {
  const successRate = calculateSuccessRate(translation);
  return 1 / (successRate + 0.1);
};

/**
 * Gets a random translation using weighted probability based on success rate
 * Items with lower success rates are shown more frequently
 */
export const getRandomTranslation = (): Translation | null => {
  const translations = getTranslations();
  if (translations.length === 0) return null;
  
  // Calculate weights for all translations
  const weights = translations.map(calculateWeight);
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight;
  
  // Find the translation corresponding to the random number
  for (let i = 0; i < translations.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return translations[i];
    }
  }
  
  // Fallback to last translation (shouldn't happen, but safety)
  return translations[translations.length - 1];
};

export const addBatchTranslations = (translations: Array<{ mandarin: string; translation: string }>): Translation[] => {
  const existingTranslations = getTranslations();
  const newTranslations: Translation[] = translations.map(({ mandarin, translation }) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    mandarin: mandarin.trim(),
    translation: translation.trim(),
    pinyin: generatePinyin(mandarin.trim()),
    correctCount: 0,
    incorrectCount: 0,
  }));
  
  existingTranslations.push(...newTranslations);
  saveTranslations(existingTranslations);
  return newTranslations;
};

/**
 * Escapes a CSV field value, wrapping in quotes if necessary
 */
const escapeCsvField = (field: string): string => {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

/**
 * Exports translations to CSV format
 * @returns CSV string with header row: mandarin,translation,pinyin
 */
export const exportTranslationsToCSV = (): string => {
  const translations = getTranslations();
  
  // Header row
  const header = 'mandarin,translation,pinyin';
  
  // Data rows
  const rows = translations.map(t => {
    const mandarin = escapeCsvField(t.mandarin);
    const translation = escapeCsvField(t.translation);
    const pinyin = escapeCsvField(t.pinyin || '');
    return `${mandarin},${translation},${pinyin}`;
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Downloads translations as a CSV file
 */
export const downloadTranslationsAsCSV = (): void => {
  const csv = exportTranslationsToCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `phraser-translations-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
