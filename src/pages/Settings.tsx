import { useState, useEffect } from 'react';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { getSettings, updateSetting, Settings } from '../utils/settings';

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    // Sync with localStorage in case it changes elsewhere
    const handleStorageChange = () => {
      setSettings(getSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleToggle = (key: keyof Settings) => {
    const newValue = !settings[key];
    updateSetting(key, newValue as Settings[keyof Settings]);
    setSettings({ ...settings, [key]: newValue });
  };

  return (
    <div className="w-full max-w-2xl mx-auto page-transition-enter">
      <PageTitle>Settings</PageTitle>
      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="active-input" className="text-base font-medium text-neutral-800 cursor-pointer">
                Active Input Mode
              </label>
              <p className="text-sm text-neutral-600 mt-1">
                Enable text input for translations in flashcards. Your answers will be validated and shown as correct/incorrect.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="active-input"
                  type="checkbox"
                  checked={settings.activeInput}
                  onChange={() => handleToggle('activeInput')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
