import { useState, useEffect } from 'react';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { getSettings, updateSetting, Settings } from '../utils/settings';
import { downloadTranslationsAsCSV, getTranslations, resetAllTranslations } from '../utils/storage';
import { useToast } from '../contexts/ToastContext';

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { showToast } = useToast();

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

  const handleExport = () => {
    const translations = getTranslations();
    if (translations.length === 0) {
      showToast('error', 'No translations to export');
      return;
    }

    try {
      downloadTranslationsAsCSV();
      showToast('success', `Exported ${translations.length} translation(s) as CSV`);
    } catch {
      showToast('error', 'Failed to export translations');
    }
  };

  const handleResetClick = () => {
    const translations = getTranslations();
    if (translations.length === 0) {
      showToast('error', 'No translations to reset');
      return;
    }
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    try {
      resetAllTranslations();
      setShowResetConfirm(false);
      showToast('success', 'All translations have been reset');
    } catch {
      showToast('error', 'Failed to reset translations');
    }
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto page-transition-enter">
      <PageTitle>Settings</PageTitle>
      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label
                htmlFor="active-input"
                className="text-base font-medium text-neutral-800 cursor-pointer"
              >
                Active Input Mode
              </label>
              <p className="text-sm text-neutral-600 mt-1">
                Enable text input for translations in flashcards. Your answers will be validated and
                shown as correct/incorrect.
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

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label
                htmlFor="reverse-mode"
                className="text-base font-medium text-neutral-800 cursor-pointer"
              >
                Reverse Mode
              </label>
              <p className="text-sm text-neutral-600 mt-1">
                Show translations and expect Mandarin as input. Useful for practicing character
                recognition.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="reverse-mode"
                  type="checkbox"
                  checked={settings.reverseMode}
                  onChange={() => handleToggle('reverseMode')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label
                htmlFor="color-coded-cards"
                className="text-base font-medium text-neutral-800 cursor-pointer"
              >
                Color Coded Cards
              </label>
              <p className="text-sm text-neutral-600 mt-1">
                Show green background for correct answers and red background for incorrect answers
                in active input mode.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="color-coded-cards"
                  type="checkbox"
                  checked={settings.colorCodedCards}
                  onChange={() => handleToggle('colorCodedCards')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium text-neutral-800 mb-1">Export Data</h3>
                <p className="text-sm text-neutral-600">
                  Download all translations as a CSV file. Format: mandarin,translation,pinyin
                </p>
              </div>
              <div className="ml-4">
                <Button variant="primary" onClick={handleExport} className="px-5 py-2.5">
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-error-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium text-error-700 mb-1">Danger Zone</h3>
                <p className="text-sm text-error-600 mt-1">
                  Permanently delete all translations. This action cannot be undone. Make sure to
                  export your data first if you want to keep a backup.
                </p>
              </div>
              <div className="ml-4">
                <Button variant="danger" onClick={handleResetClick} className="px-5 py-2.5">
                  Reset All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Data"
        message={`Are you sure you want to delete all ${getTranslations().length} translation(s)? This action cannot be undone.`}
        confirmText="Reset All Data"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
      />
    </div>
  );
}

export default SettingsPage;
