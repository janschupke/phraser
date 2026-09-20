import { useSyncExternalStore } from 'react';
import { storageManager } from '../utils/storageManager';
import { getTranslations } from '../utils/translationService';
import { getSettings, type Settings } from '../utils/settings';
import type { Translation } from '../types';

/**
 * The stored translations, re-rendering on every write -- including writes from
 * another tab.
 *
 * This replaces a 500ms setInterval that polled localStorage.
 */
export function useTranslations(): Translation[] {
  return useSyncExternalStore(storageManager.subscribe, getTranslations);
}

/**
 * The stored settings, re-rendering on every write.
 *
 * This replaces a second 500ms setInterval.
 */
export function useSettings(): Settings {
  return useSyncExternalStore(storageManager.subscribe, getSettings);
}
