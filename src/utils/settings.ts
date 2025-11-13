const SETTINGS_KEY = 'phraser-settings';

export interface Settings {
  activeInput: boolean;
}

const defaultSettings: Settings = {
  activeInput: false,
};

export const getSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
};
