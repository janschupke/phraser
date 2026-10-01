import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { updateTranslation, deleteTranslation } from '../utils/translationService';
import { useTranslations } from '../hooks/useStoredState';
import { filterTranslations } from '../utils/search';
import type { Translation } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TranslationCard } from '../components/features/TranslationCard';
import { TranslationEditor } from '../components/features/TranslationEditor';

function ListTranslations() {
  const translations = useTranslations();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; mandarin: string } | null>(null);
  const { showToast } = useToast();

  const visible = useMemo(() => filterTranslations(translations, query), [translations, query]);

  // replace: true so typing does not fill the history stack with keystrokes.
  const setQuery = (next: string) => {
    setSearchParams(next ? { q: next } : {}, { replace: true });
  };

  const handleSave = (id: string, mandarin: string, translation: string) => {
    if (!mandarin.trim() || !translation.trim()) {
      showToast('error', 'Please fill in both fields');
      return;
    }

    void saveEdit(id, mandarin.trim(), translation.trim());
  };

  const saveEdit = async (id: string, mandarin: string, translation: string) => {
    if (await updateTranslation(id, mandarin, translation)) {
      setEditingId(null);
      showToast('success', 'Translation updated successfully!');
    } else {
      showToast('error', 'Failed to update translation');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteTranslation(deleteConfirm.id)) {
      showToast('success', 'Translation deleted successfully!');
    } else {
      showToast('error', 'Failed to delete translation');
    }
    setDeleteConfirm(null);
  };

  const hasAny = translations.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto page-transition-enter">
      <PageTitle>All Translations</PageTitle>

      {hasAny && (
        <div className="mb-4">
          <div className="relative">
            <Input
              id="translation-search"
              type="search"
              label="Search translations"
              placeholder="Search Mandarin, pinyin, or translation"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pr-10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search field"
                className="absolute right-2 bottom-1.5 p-1.5 text-neutral-500 hover:text-neutral-700 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                ×
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-neutral-500">
            {query
              ? `Showing ${visible.length} of ${translations.length}`
              : `${translations.length} translation${translations.length === 1 ? '' : 's'}`}
          </p>
        </div>
      )}

      {!hasAny ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-neutral-600 text-lg sm:text-xl">
            No translations saved yet. Add some translations to get started!
          </p>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-neutral-600 mb-4">No translations match &quot;{query}&quot;.</p>
          <Button variant="neutral" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-neutral-200">
            {visible.map(translation => (
              <li key={translation.id}>
                {editingId === translation.id ? (
                  <div className="p-4">
                    <TranslationEditor
                      translation={translation}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <TranslationCard
                    translation={translation}
                    onEdit={(t: Translation) => setEditingId(t.id)}
                    onDelete={(t: Translation) =>
                      setDeleteConfirm({ id: t.id, mandarin: t.mandarin })
                    }
                    showSecondary={query.length > 0}
                  />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Translation"
        message={`Are you sure you want to delete "${deleteConfirm?.mandarin}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default ListTranslations;
