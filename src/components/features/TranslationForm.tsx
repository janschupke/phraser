import { useState, useRef, useEffect } from 'react';
import type { FormSubmitHandler } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TranslationFormProps {
  onSubmit: (mandarin: string, translation: string) => void;
  initialMandarin?: string;
  initialTranslation?: string;
  submitLabel?: string;
  autoFocus?: boolean;
}

export function TranslationForm({
  onSubmit,
  initialMandarin = '',
  initialTranslation = '',
  submitLabel = 'Add Translation',
  autoFocus = false,
}: TranslationFormProps) {
  const [mandarin, setMandarin] = useState(initialMandarin);
  const [translation, setTranslation] = useState(initialTranslation);
  const { showToast } = useToast();
  const mandarinInputRef = useRef<HTMLInputElement>(null);
  const translationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus synchronously on mount. This used to run behind a 100ms timer,
    // which stole focus back from whatever the user had already tabbed or
    // clicked into -- typing straight after navigating would drop the rest of
    // your keystrokes into the wrong field. The timer was never cleared either.
    if (autoFocus) {
      mandarinInputRef.current?.focus();
    }
  }, [autoFocus]);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Blur any focused input within this form
        if (
          document.activeElement instanceof HTMLInputElement &&
          formRef.current?.contains(document.activeElement)
        ) {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit: FormSubmitHandler = e => {
    e.preventDefault();

    if (!mandarin.trim() || !translation.trim()) {
      showToast('error', 'Please fill in both fields');
      return;
    }

    try {
      onSubmit(mandarin.trim(), translation.trim());
      showToast('success', 'Translation saved successfully!');
      if (!initialMandarin && !initialTranslation) {
        setMandarin('');
        setTranslation('');
      }
    } catch {
      showToast('error', 'Failed to save translation');
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <Input
        ref={mandarinInputRef}
        id="mandarin"
        label="Mandarin (中文)"
        value={mandarin}
        onChange={e => setMandarin(e.target.value)}
        placeholder="Enter word, phrase, or sentence in Mandarin"
      />

      <Input
        ref={translationInputRef}
        id="translation"
        label="Translation"
        value={translation}
        onChange={e => setTranslation(e.target.value)}
        placeholder="Enter translation"
      />

      <Button type="submit" variant="primary" className="w-full py-3">
        {submitLabel}
      </Button>
    </form>
  );
}
