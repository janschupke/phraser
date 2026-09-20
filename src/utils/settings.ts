import { storageManager } from './storageManager';

export interface Settings {
  activeInput: boolean;
  reverseMode: boolean;
  colorCodedCards: boolean;
}

// Frozen: getSettings hands this exact object back when nothing is stored, so
// anything that mutated its result would corrupt the defaults for the session.
const defaultSettings: Settings = Object.freeze({
  activeInput: false,
  reverseMode: false,
  colorCodedCards: true,
});

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
  // Copy rather than mutate: getSettings returns the shared defaults object
  // when nothing is stored yet, so assigning into it changed the defaults
  // themselves for the rest of the session.
  saveSettings({ ...getSettings(), [key]: value });
};
