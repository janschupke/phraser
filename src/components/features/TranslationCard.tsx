import { Translation } from '../../types';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { Button } from '../ui/Button';

interface TranslationCardProps {
  translation: Translation;
  onEdit: (translation: Translation) => void;
  onDelete: (id: string) => void;
}

export function TranslationCard({ translation, onEdit, onDelete }: TranslationCardProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="mb-3 sm:mb-4">
          <span className="text-sm text-neutral-500">Mandarin:</span>
          <div className="text-xl sm:text-2xl font-semibold text-neutral-800 mt-1 break-words">
            {translation.mandarin}
          </div>
          {translation.pinyin && (
            <div className="text-base sm:text-lg text-neutral-500 mt-2 font-normal break-words">
              {translation.pinyin}
            </div>
          )}
        </div>
        <div>
          <span className="text-sm text-neutral-500">English:</span>
          <div className="text-lg sm:text-xl text-neutral-700 mt-1 break-words">
            {translation.english}
          </div>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 flex-shrink-0">
        <Button
          variant="icon"
          onClick={() => onEdit(translation)}
          aria-label="Edit translation"
          title="Edit"
          className="text-neutral-400 hover:text-primary-600"
        >
          <HiOutlinePencil className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <Button
          variant="icon"
          onClick={() => onDelete(translation.id)}
          aria-label="Delete translation"
          title="Delete"
          className="text-neutral-400 hover:text-error-600"
        >
          <HiOutlineTrash className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>
    </div>
  );
}
