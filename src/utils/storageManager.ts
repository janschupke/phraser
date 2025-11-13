/**
 * Centralized storage manager for all localStorage operations
 * Handles key management, serialization, and error handling
 */

const STORAGE_KEYS = {
  TRANSLATIONS: 'phraser',
  SETTINGS: 'phraser-settings',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

class StorageManager {
  /**
   * Gets a value from localStorage
   */
  get<T>(key: StorageKey): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Sets a value in localStorage
   */
  set<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Removes a value from localStorage
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Clears all application data from localStorage
   */
  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }

  /**
   * Gets the storage key for translations
   */
  getTranslationsKey(): StorageKey {
    return STORAGE_KEYS.TRANSLATIONS;
  }

  /**
   * Gets the storage key for settings
   */
  getSettingsKey(): StorageKey {
    return STORAGE_KEYS.SETTINGS;
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
