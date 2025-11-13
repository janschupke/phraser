import { useState } from 'react';
import { Translation } from '../../types';
import { HiOutlinePencil, HiOutlineTrash, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { Button } from '../ui/Button';

interface TranslationCardProps {
  translation: Translation;
  onEdit: (translation: Translation) => void;
  onDelete: (translation: Translation) => void;
}

export function TranslationCard({ translation, onEdit, onDelete }: TranslationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const correctCount = translation.correctCount ?? 0;
  const incorrectCount = translation.incorrectCount ?? 0;
  const totalAttempts = correctCount + incorrectCount;
  const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : null;

  const toggleExpand = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="flex justify-between items-start gap-4 cursor-pointer -m-6 sm:-m-8 p-6 sm:p-8"
      onClick={handleCardClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <button
            onClick={toggleExpand}
            className="mt-1 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 flex-shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <HiChevronUp className="w-5 h-5 transition-transform duration-300" />
            ) : (
              <HiChevronDown className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="mb-3 sm:mb-4">
              <span className="text-sm text-neutral-500">Mandarin:</span>
              <div className="text-xl sm:text-2xl font-semibold text-neutral-800 mt-1 break-words">
                {translation.mandarin}
              </div>
            </div>
            {isExpanded && (
              <div 
                className="overflow-hidden animate-fade-in"
              >
                <div className="pt-0">
                  {translation.pinyin && (
                    <div className="mb-3 sm:mb-4">
                      <div className="text-base sm:text-lg text-neutral-500 font-normal break-words">
                        {translation.pinyin}
                      </div>
                    </div>
                  )}
                  <div className="mb-3 sm:mb-4">
                    <span className="text-sm text-neutral-500">Translation:</span>
                    <div className="text-lg sm:text-xl text-neutral-700 mt-1 break-words">
                      {translation.translation}
                    </div>
                  </div>
                  {totalAttempts > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500">Score:</span>
                          <span className="font-medium text-success-600">{correctCount}</span>
                          <span className="text-neutral-400">/</span>
                          <span className="font-medium text-error-600">{incorrectCount}</span>
                        </div>
                        {successRate !== null && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-500">Success rate:</span>
                              <span className={`font-medium ${
                                successRate >= 80 ? 'text-success-600' :
                                successRate >= 50 ? 'text-neutral-600' :
                                'text-error-600'
                              }`}>
                                {successRate}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 flex-shrink-0" onClick={handleActionClick}>
        <Button
          variant="icon"
          onClick={(e) => {
            handleActionClick(e);
            onEdit(translation);
          }}
          aria-label="Edit translation"
          title="Edit"
          className="text-neutral-400 hover:text-primary-600"
        >
          <HiOutlinePencil className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <Button
          variant="icon"
          onClick={(e) => {
            handleActionClick(e);
            onDelete(translation);
          }}
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
