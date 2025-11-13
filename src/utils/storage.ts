/**
 * Storage utilities - backward compatibility layer
 * Re-exports from refactored modules
 * 
 * @deprecated This file is maintained for backward compatibility.
 * New code should import directly from:
 * - translationService.ts for translation operations
 * - probability.ts for selection logic
 * - csvExport.ts for CSV operations
 * - storageManager.ts for low-level storage operations
 */
import {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  addBatchTranslations,
  recordCorrectAnswer,
  recordIncorrectAnswer,
} from './translationService';
import { selectRandomTranslation } from './probability';
import { exportTranslationsToCSV as exportToCSV, downloadTranslationsAsCSV as downloadCSV } from './csvExport';
import { storageManager } from './storageManager';

// Re-export translation service functions
export {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  addBatchTranslations,
  recordCorrectAnswer,
  recordIncorrectAnswer,
};

/**
 * Gets a random translation using weighted probability
 * Wrapper for backward compatibility
 */
export const getRandomTranslation = (): ReturnType<typeof selectRandomTranslation> => {
  const translations = getTranslations();
  return selectRandomTranslation(translations);
};

/**
 * Exports translations to CSV format
 * Wrapper for backward compatibility
 */
export const exportTranslationsToCSV = (): string => {
  const translations = getTranslations();
  return exportToCSV(translations);
};

/**
 * Downloads translations as a CSV file
 * Wrapper for backward compatibility
 */
export const downloadTranslationsAsCSV = (): void => {
  const translations = getTranslations();
  downloadCSV(translations);
};

/**
 * @deprecated Use translationService methods instead
 * Saves translations to storage
 * Note: This function is kept for backward compatibility.
 * Prefer using translationService methods which handle saving automatically.
 */
export const saveTranslations = (translations: ReturnType<typeof getTranslations>): void => {
  // Use storageManager directly for backward compatibility
  storageManager.set(storageManager.getTranslationsKey(), translations);
};
