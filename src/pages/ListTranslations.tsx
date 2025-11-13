import { useState, useEffect } from 'react';
import { getTranslations, updateTranslation, deleteTranslation } from '../utils/storage';
import { Translation } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TranslationCard } from '../components/features/TranslationCard';
import { TranslationEditor } from '../components/features/TranslationEditor';

function ListTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; mandarin: string } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = () => {
    setTranslations(getTranslations());
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
  };

  const handleSave = (id: string, mandarin: string, translation: string) => {
    if (!mandarin.trim() || !translation.trim()) {
      showToast('error', 'Please fill in both fields');
      return;
    }

    if (updateTranslation(id, mandarin.trim(), translation.trim())) {
      setEditingId(null);
      loadTranslations();
      showToast('success', 'Translation updated successfully!');
    } else {
      showToast('error', 'Failed to update translation');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDeleteClick = (translation: Translation) => {
    setDeleteConfirm({ id: translation.id, mandarin: translation.mandarin });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      if (deleteTranslation(deleteConfirm.id)) {
        loadTranslations();
        showToast('success', 'Translation deleted successfully!');
      } else {
        showToast('error', 'Failed to delete translation');
      }
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto page-transition-enter">
      <PageTitle>All Translations</PageTitle>

      {translations.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-neutral-600 text-lg sm:text-xl">
            No translations saved yet. Add some translations to get started!
          </p>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {translations.map(translation => (
            <Card key={translation.id} hover className="p-6 sm:p-8">
              {editingId === translation.id ? (
                <div className="animate-fade-in">
                  <TranslationEditor
                    translation={translation}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <TranslationCard
                    translation={translation}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Translation"
        message={`Are you sure you want to delete "${deleteConfirm?.mandarin}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default ListTranslations;
