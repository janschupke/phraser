/**
 * Centralized storage manager for all localStorage operations.
 * Handles key management, serialization, error handling, and change notification.
 */

const STORAGE_KEYS = {
  TRANSLATIONS: 'phraser',
  SETTINGS: 'phraser-settings',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

class StorageManager {
  /**
   * Parsed values, kept so that repeated reads return the *same* object.
   *
   * This is what makes useSyncExternalStore viable: it compares snapshots by
   * reference, so a get() that re-parsed on every call would report a change on
   * every render and loop forever.
   */
  readonly #cache = new Map<StorageKey, unknown>();
  readonly #listeners = new Set<() => void>();
  #watchingOtherTabs = false;

  get<T>(key: StorageKey): T | null {
    if (this.#cache.has(key)) {
      return this.#cache.get(key) as T | null;
    }
    let parsed: T | null = null;
    try {
      const item = localStorage.getItem(key);
      // JSON.parse returns any; nothing validates the shape of persisted data.
      parsed = item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
    }
    this.#cache.set(key, parsed);
    return parsed;
  }

  set<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
    // Drop rather than store `value`: callers routinely mutate the array they
    // read from get() and hand the same reference back, so caching it here
    // would leave the snapshot reference unchanged and suppress the re-render.
    this.#invalidate(key);
  }

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
    this.#invalidate(key);
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }

  /**
   * Subscribes to changes, including writes from another tab.
   * Returns an unsubscribe function.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    this.#watchOtherTabs();
    return () => {
      this.#listeners.delete(listener);
    };
  };

  getTranslationsKey(): StorageKey {
    return STORAGE_KEYS.TRANSLATIONS;
  }

  getSettingsKey(): StorageKey {
    return STORAGE_KEYS.SETTINGS;
  }

  #invalidate(key: StorageKey): void {
    this.#cache.delete(key);
    this.#listeners.forEach(listener => {
      listener();
    });
  }

  #watchOtherTabs(): void {
    if (this.#watchingOtherTabs || typeof window === 'undefined') return;
    this.#watchingOtherTabs = true;
    window.addEventListener('storage', () => {
      this.#cache.clear();
      this.#listeners.forEach(listener => {
        listener();
      });
    });
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
