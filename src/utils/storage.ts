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
