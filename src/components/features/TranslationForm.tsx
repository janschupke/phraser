import { useState, FormEvent, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TranslationFormProps {
  onSubmit: (mandarin: string, english: string) => void;
  initialMandarin?: string;
  initialEnglish?: string;
  submitLabel?: string;
  autoFocus?: boolean;
}

export function TranslationForm({
  onSubmit,
  initialMandarin = '',
  initialEnglish = '',
  submitLabel = 'Add Translation',
  autoFocus = false,
}: TranslationFormProps) {
  const [mandarin, setMandarin] = useState(initialMandarin);
  const [english, setEnglish] = useState(initialEnglish);
  const { showToast } = useToast();
  const mandarinInputRef = useRef<HTMLInputElement>(null);
  const englishInputRef = useRef<HTMLInputElement>(null);

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

    if (!mandarin.trim() || !english.trim()) {
      showToast('error', 'Please fill in both fields');
      return;
    }

    try {
      onSubmit(mandarin.trim(), english.trim());
      showToast('success', 'Translation saved successfully!');
      if (!initialMandarin && !initialEnglish) {
        setMandarin('');
        setEnglish('');
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
        ref={englishInputRef}
        id="english"
        label="English Translation"
        value={english}
        onChange={e => setEnglish(e.target.value)}
        placeholder="Enter English translation"
      />

      <Button type="submit" variant="primary" className="w-full py-3">
        {submitLabel}
      </Button>
    </form>
  );
}
