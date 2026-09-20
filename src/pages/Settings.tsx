import { useState } from 'react';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ToggleSetting } from '../components/ui/ToggleSetting';
import { updateSetting, type Settings } from '../utils/settings';
import { useSettings, useTranslations } from '../hooks/useStoredState';
import { resetAllTranslations } from '../utils/translationService';
import { downloadTranslationsAsCSV } from '../utils/csvExport';
import { useToast } from '../contexts/ToastContext';

function SettingsPage() {
  const settings = useSettings();
  const translations = useTranslations();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { showToast } = useToast();

  const handleToggle = (key: keyof Settings) => {
    updateSetting(key, !settings[key]);
  };

  const handleExport = () => {
    if (translations.length === 0) {
      showToast('error', 'No translations to export');
      return;
    }

    try {
      downloadTranslationsAsCSV(translations);
      showToast('success', `Exported ${translations.length} translation(s) as CSV`);
    } catch {
      showToast('error', 'Failed to export translations');
    }
  };

  const handleResetClick = () => {
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
          <ToggleSetting
            label="Active Input Mode"
            description="Enable text input for translations in flashcards. Your answers will be validated and shown as correct/incorrect."
            checked={settings.activeInput}
            onChange={() => handleToggle('activeInput')}
          />

          <ToggleSetting
            label="Reverse Mode"
            description="Show translations and expect Mandarin as input. Useful for practicing character recognition."
            checked={settings.reverseMode}
            onChange={() => handleToggle('reverseMode')}
          />

          <ToggleSetting
            label="Color Coded Cards"
            description="Show green background for correct answers and red background for incorrect answers in active input mode."
            checked={settings.colorCodedCards}
            onChange={() => handleToggle('colorCodedCards')}
          />

          <div className="pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-base font-medium text-neutral-800 mb-1">Export Data</h2>
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
                <h2 className="text-base font-medium text-error-700 mb-1">Danger Zone</h2>
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
        message={`Are you sure you want to delete all ${translations.length} translation(s)? This action cannot be undone.`}
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
