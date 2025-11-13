/**
 * Normalizes a string by removing diacritics, accents, punctuation, and converting to lowercase
 * This allows for case-insensitive, accent-insensitive, and punctuation-insensitive comparison
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\w\s]/g, '') // Remove all punctuation (keep only word characters and whitespace)
    .toLowerCase()
    .trim();
}

/**
 * Compares two strings ignoring case, diacritics, accents, and punctuation
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns true if strings are equivalent (ignoring case, diacritics, accents, punctuation)
 */
export function compareStrings(str1: string, str2: string): boolean {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);
  return normalized1 === normalized2;
}

/**
 * Validates a user's translation input against the correct answer
 * @param userInput The user's input
 * @param correctAnswer The correct translation
 * @returns true if the input matches the correct answer (case-insensitive, accent-insensitive, punctuation-insensitive)
 */
export function validateTranslation(userInput: string, correctAnswer: string): boolean {
  // Empty input is considered incorrect
  if (!userInput.trim()) {
    return false;
  }

  return compareStrings(userInput, correctAnswer);
}
