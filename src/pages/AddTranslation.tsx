import { addTranslation } from '../utils/storage';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { TranslationForm } from '../components/features/TranslationForm';

function AddTranslation() {
  const handleSubmit = (mandarin: string, english: string) => {
    addTranslation(mandarin, english);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageTitle>Add Translation</PageTitle>
      <Card className="p-6 sm:p-8">
        <TranslationForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}

export default AddTranslation;
