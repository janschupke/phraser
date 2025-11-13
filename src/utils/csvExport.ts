/**
 * CSV export utilities for translations
 */
import { Translation } from '../types';

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
export const exportTranslationsToCSV = (translations: Translation[]): string => {
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
export const downloadTranslationsAsCSV = (translations: Translation[]): void => {
  const csv = exportTranslationsToCSV(translations);
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
