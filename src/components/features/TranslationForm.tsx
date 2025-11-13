import { useState, FormEvent, useRef, useEffect } from 'react';
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
    if (autoFocus && mandarinInputRef.current) {
      // Small delay to ensure the page transition has completed
      setTimeout(() => {
        mandarinInputRef.current?.focus();
      }, 100);
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

  const handleSubmit = (e: FormEvent) => {
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
