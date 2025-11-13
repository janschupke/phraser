import { useState, useEffect, useRef, useCallback } from 'react';
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
  const mandarinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMandarin(translation.mandarin);
    setEnglish(translation.english);
    // Focus the first input when editor opens
    setTimeout(() => {
      mandarinInputRef.current?.focus();
    }, 100);
  }, [translation]);

  const handleSave = useCallback(() => {
    if (!mandarin.trim() || !english.trim()) {
      return;
    }
    onSave(translation.id, mandarin.trim(), english.trim());
  }, [mandarin, english, translation.id, onSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6 animate-fade-in">
      <Input
        ref={mandarinInputRef}
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
        <Button type="submit" variant="success" className="px-5 py-2.5">
          Save
        </Button>
        <Button type="button" variant="neutral" onClick={onCancel} className="px-5 py-2.5">
          Cancel
        </Button>
      </div>
    </form>
  );
}
