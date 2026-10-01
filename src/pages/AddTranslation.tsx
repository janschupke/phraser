import { useState } from 'react';
import { addTranslation, addBatchTranslations } from '../utils/translationService';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { TranslationForm } from '../components/features/TranslationForm';
import { BatchImportForm } from '../components/features/BatchImportForm';
import { BatchImportReview } from '../components/features/BatchImportReview';
import { useToast } from '../contexts/ToastContext';

type TabType = 'single' | 'batch';

function AddTranslation() {
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [reviewEntries, setReviewEntries] = useState<
    | {
        mandarin: string;
        translation: string;
      }[]
    | null
  >(null);
  const { showToast } = useToast();

  const handleSingleSubmit = (mandarin: string, translation: string) =>
    addTranslation(mandarin, translation);

  const handleBatchImport = (entries: { mandarin: string; translation: string }[]) => {
    setReviewEntries(entries);
  };

  const handleBatchSave = (entries: { mandarin: string; translation: string }[]) => {
    void saveBatch(entries);
  };

  const saveBatch = async (entries: { mandarin: string; translation: string }[]) => {
    try {
      const saved = await addBatchTranslations(entries);
      showToast('success', `Successfully imported ${saved.length} translation(s)!`);
      setReviewEntries(null);
      setActiveTab('single');
    } catch {
      showToast('error', 'Failed to save translations');
    }
  };

  const handleBatchCancel = () => {
    setReviewEntries(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto page-transition-enter">
      <PageTitle>Add Translation</PageTitle>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-neutral-300">
        <button
          aria-pressed={activeTab === 'single'}
          onClick={() => {
            setActiveTab('single');
            setReviewEntries(null);
          }}
          className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'single'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-800'
          }`}
        >
          Single Entry
        </button>
        <button
          aria-pressed={activeTab === 'batch'}
          onClick={() => {
            setActiveTab('batch');
            setReviewEntries(null);
          }}
          className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'batch'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-800'
          }`}
        >
          Batch Import
        </button>
      </div>

      <Card className="p-6 sm:p-8">
        {reviewEntries ? (
          <BatchImportReview
            entries={reviewEntries}
            onSave={handleBatchSave}
            onCancel={handleBatchCancel}
          />
        ) : activeTab === 'single' ? (
          <TranslationForm onSubmit={handleSingleSubmit} focusOnMount />
        ) : (
          <BatchImportForm onImport={handleBatchImport} />
        )}
      </Card>
    </div>
  );
}

export default AddTranslation;
