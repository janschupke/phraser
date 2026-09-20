import { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineTrash } from 'react-icons/hi';
import { useHotkeys } from '../../hooks/useHotkeys';
import type { FormSubmitHandler, Translation } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TranslationEditorProps {
  translation: Translation;
  onSave: (id: string, mandarin: string, translation: string) => void;
  onCancel: () => void;
  /** Renders a delete affordance in the header when provided. */
  onDelete?: () => void;
  /** Heading shown above the fields. Omitted on the list page, where the row provides context. */
  title?: string;
}

export function TranslationEditor({
  translation,
  onSave,
  onCancel,
  onDelete,
  title,
}: TranslationEditorProps) {
  const [mandarin, setMandarin] = useState(translation.mandarin);
  const [translationText, setTranslationText] = useState(translation.translation);
  const mandarinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMandarin(translation.mandarin);
    setTranslationText(translation.translation);
  }, [translation]);

  // Focus the first field when the editor opens. Synchronous, not behind a
  // timer: a delayed focus steals it back from wherever the user has moved.
  useEffect(() => {
    mandarinInputRef.current?.focus();
  }, [translation.id]);

  const handleSave = useCallback(() => {
    if (!mandarin.trim() || !translationText.trim()) {
      return;
    }
    onSave(translation.id, mandarin.trim(), translationText.trim());
  }, [mandarin, translationText, translation.id, onSave]);

  useHotkeys({ Escape: onCancel }, { allowInEditable: true });

  const handleFormSubmit: FormSubmitHandler = e => {
    e.preventDefault();
    handleSave();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6 animate-fade-in">
      {(title ?? onDelete) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>}
          {onDelete && (
            <Button
              type="button"
              variant="icon"
              onClick={onDelete}
              className="ml-auto text-error-600 hover:text-error-700 hover:bg-error-50"
              aria-label="Delete translation"
              title="Delete"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}
      <Input
        ref={mandarinInputRef}
        id={`edit-mandarin-${translation.id}`}
        label="Mandarin (中文)"
        value={mandarin}
        onChange={e => setMandarin(e.target.value)}
        className="text-base"
      />
      <Input
        id={`edit-translation-${translation.id}`}
        label="Translation"
        value={translationText}
        onChange={e => setTranslationText(e.target.value)}
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
