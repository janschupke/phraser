/**
 * Pinyin generation utilities
 */
import { pinyin } from 'pinyin-pro';

/**
 * Generates pinyin with tone marks for Mandarin text
 */
export const generatePinyin = (mandarin: string): string => {
  try {
    return pinyin(mandarin, { toneType: 'symbol' });
  } catch {
    return '';
  }
};
