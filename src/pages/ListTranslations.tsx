import { useState, useEffect } from 'react';
import { getTranslations, updateTranslation, deleteTranslation } from '../utils/storage';
import { Translation } from '../types';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { TranslationCard } from '../components/features/TranslationCard';
import { TranslationEditor } from '../components/features/TranslationEditor';

function ListTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = () => {
    setTranslations(getTranslations());
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
  };

  const handleSave = (id: string, mandarin: string, english: string) => {
    if (updateTranslation(id, mandarin, english)) {
      setEditingId(null);
      loadTranslations();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this translation?')) {
      if (deleteTranslation(id)) {
        loadTranslations();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
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
                <TranslationEditor
                  translation={translation}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <TranslationCard
                  translation={translation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListTranslations;
