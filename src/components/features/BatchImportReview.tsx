import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface BatchImportReviewProps {
  entries: Array<{ mandarin: string; translation: string }>;
  onSave: (entries: Array<{ mandarin: string; translation: string }>) => void;
  onCancel: () => void;
}

export function BatchImportReview({ entries, onSave, onCancel }: BatchImportReviewProps) {
  const [editedEntries, setEditedEntries] = useState(entries);
  const { showToast } = useToast();

  const handleEntryChange = (index: number, field: 'mandarin' | 'translation', value: string) => {
    const updated = [...editedEntries];
    updated[index] = { ...updated[index], [field]: value };
    setEditedEntries(updated);
  };

  const handleDelete = (index: number) => {
    const updated = editedEntries.filter((_, i) => i !== index);
    setEditedEntries(updated);
  };

  const handleSave = () => {
    const validEntries = editedEntries.filter(
      entry => entry.mandarin.trim() && entry.translation.trim()
    );

    if (validEntries.length === 0) {
      showToast('error', 'No valid entries to save');
      return;
    }

    onSave(validEntries);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-800">
          Review Import ({editedEntries.length} entries)
        </h3>
        <div className="flex gap-2">
          <Button variant="neutral" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save All ({editedEntries.filter(e => e.mandarin.trim() && e.translation.trim()).length})
          </Button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
        {editedEntries.map((entry, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500 w-8">#{index + 1}</span>
                  <Input
                    value={entry.mandarin}
                    onChange={e => handleEntryChange(index, 'mandarin', e.target.value)}
                    placeholder="Mandarin (中文)"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500 w-8"></span>
                  <Input
                    value={entry.translation}
                    onChange={e => handleEntryChange(index, 'translation', e.target.value)}
                    placeholder="Translation"
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
                variant="neutral"
                onClick={() => handleDelete(index)}
                className="text-error-600 hover:text-error-700 hover:bg-error-50"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editedEntries.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No entries to review. All entries have been removed.
        </div>
      )}
    </div>
  );
}
