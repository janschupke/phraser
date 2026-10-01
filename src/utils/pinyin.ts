/**
 * Pinyin generation utilities
 */

/**
 * Generates pinyin with tone marks for Mandarin text.
 *
 * pinyin-pro is imported on first use rather than up front: its dictionary is
 * ~460 kB minified, three quarters of the app, and only the save path needs it.
 */
export const generatePinyin = async (mandarin: string): Promise<string> => {
  try {
    const { pinyin } = await import('pinyin-pro');
    return pinyin(mandarin, { toneType: 'symbol' });
  } catch {
    return '';
  }
};
