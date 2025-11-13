import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface TranslationFormProps {
  onSubmit: (mandarin: string, english: string) => void;
  initialMandarin?: string;
  initialEnglish?: string;
  submitLabel?: string;
}

export function TranslationForm({
  onSubmit,
  initialMandarin = '',
  initialEnglish = '',
  submitLabel = 'Add Translation',
}: TranslationFormProps) {
  const [mandarin, setMandarin] = useState(initialMandarin);
  const [english, setEnglish] = useState(initialEnglish);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!mandarin.trim() || !english.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both fields' });
      return;
    }

    try {
      onSubmit(mandarin.trim(), english.trim());
      setMessage({ type: 'success', text: 'Translation saved successfully!' });
      if (!initialMandarin && !initialEnglish) {
        setMandarin('');
        setEnglish('');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save translation' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="mandarin"
        label="Mandarin (中文)"
        value={mandarin}
        onChange={e => setMandarin(e.target.value)}
        placeholder="Enter word, phrase, or sentence in Mandarin"
      />

      <Input
        id="english"
        label="English Translation"
        value={english}
        onChange={e => setEnglish(e.target.value)}
        placeholder="Enter English translation"
      />

      {message && <Alert type={message.type}>{message.text}</Alert>}

      <Button type="submit" variant="primary" className="w-full py-3">
        {submitLabel}
      </Button>
    </form>
  );
}
