import { storageManager } from './storageManager';

export interface Settings {
  activeInput: boolean;
  reverseMode: boolean;
  colorCodedCards: boolean;
}

const defaultSettings: Settings = {
  activeInput: false,
  reverseMode: false,
  colorCodedCards: true,
};

// getSettings merges over defaults, which would allocate a new object on every
// call. Memoizing against the (referentially stable) stored value keeps the
// snapshot identity intact between writes.
let merged: { stored: Settings | null; value: Settings } | null = null;

export const getSettings = (): Settings => {
  const stored = storageManager.get<Settings>(storageManager.getSettingsKey());
  if (merged?.stored === stored) {
    return merged.value;
  }
  const value = stored ? { ...defaultSettings, ...stored } : defaultSettings;
  merged = { stored, value };
  return value;
};

export const saveSettings = (settings: Settings): void => {
  storageManager.set(storageManager.getSettingsKey(), settings);
};

export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
};
