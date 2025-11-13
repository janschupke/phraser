import { storageManager } from './storageManager';

export interface Settings {
  activeInput: boolean;
  reverseMode: boolean;
}

const defaultSettings: Settings = {
  activeInput: false,
  reverseMode: false,
};

export const getSettings = (): Settings => {
  const stored = storageManager.get<Settings>(storageManager.getSettingsKey());
  if (stored) {
    return { ...defaultSettings, ...stored };
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  storageManager.set(storageManager.getSettingsKey(), settings);
};

export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
};
