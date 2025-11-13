import { useState, useEffect } from 'react';
import { Translation } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TranslationEditorProps {
  translation: Translation;
  onSave: (id: string, mandarin: string, english: string) => void;
  onCancel: () => void;
}

export function TranslationEditor({ translation, onSave, onCancel }: TranslationEditorProps) {
  const [mandarin, setMandarin] = useState(translation.mandarin);
  const [english, setEnglish] = useState(translation.english);

  useEffect(() => {
    setMandarin(translation.mandarin);
    setEnglish(translation.english);
  }, [translation]);

  const handleSave = () => {
    if (!mandarin.trim() || !english.trim()) {
      return;
    }
    onSave(translation.id, mandarin.trim(), english.trim());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Input
        id={`edit-mandarin-${translation.id}`}
        label="Mandarin (中文)"
        value={mandarin}
        onChange={e => setMandarin(e.target.value)}
        className="text-base"
      />
      <Input
        id={`edit-english-${translation.id}`}
        label="English Translation"
        value={english}
        onChange={e => setEnglish(e.target.value)}
        className="text-base"
      />
      <div className="flex gap-3">
        <Button variant="success" onClick={handleSave} className="px-5 py-2.5">
          Save
        </Button>
        <Button variant="neutral" onClick={onCancel} className="px-5 py-2.5">
          Cancel
        </Button>
      </div>
    </div>
  );
}
