import { useId, useState } from 'react';
import type { Translation } from '../../types';
import { HiOutlinePencil, HiOutlineTrash, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

interface TranslationCardProps {
  translation: Translation;
  onEdit: (translation: Translation) => void;
  onDelete: (translation: Translation) => void;
  /**
   * Show the translation on the collapsed row too. Set while a search is
   * active, so results found by English or pinyin are verifiable without
   * expanding each one.
   */
  showSecondary?: boolean;
}

export function TranslationCard({
  translation,
  onEdit,
  onDelete,
  showSecondary = false,
}: TranslationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

  const correctCount = translation.correctCount ?? 0;
  const incorrectCount = translation.incorrectCount ?? 0;
  const totalAttempts = correctCount + incorrectCount;
  const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : null;

  return (
    <div className="px-2 py-1 sm:px-3">
      {/* min-h-11 keeps the row at the 44px pointer-target minimum; density and
          WCAG 2.5.5 trade directly against each other here. */}
      <div data-row className="flex min-h-11 items-center gap-2 rounded-lg hover:bg-hover">
        {/*
          A real disclosure button, named by the Mandarin text it reveals. This
          replaces an onClick on a plain div wrapping the whole row, which meant
          the edit and delete buttons were nested inside a click target and
          needed stopPropagation to work.
        */}
        <button
          type="button"
          onClick={() => setIsExpanded(open => !open)}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="flex-1 min-w-0 flex items-center gap-2 text-left rounded-lg px-1 py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span className="shrink-0 text-neutral-500">
            {isExpanded ? (
              <HiChevronUp className="w-5 h-5" />
            ) : (
              <HiChevronDown className="w-5 h-5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span lang="zh-Hans" className="block text-lg font-medium text-neutral-800 truncate">
              {translation.mandarin}
            </span>
            {showSecondary && !isExpanded && (
              <span className="block text-sm text-neutral-600 truncate">
                {translation.translation}
              </span>
            )}
          </span>
          {translation.pinyin && !isExpanded && (
            <span className="hidden sm:block shrink-0 max-w-[40%] truncate text-sm text-neutral-600">
              {translation.pinyin}
            </span>
          )}
        </button>

        <div className="flex shrink-0 gap-1">
          <Tooltip label="Edit">
            <Button
              variant="icon"
              onClick={() => onEdit(translation)}
              aria-label={`Edit ${translation.mandarin}`}
              className="text-neutral-500 hover:text-primary-600"
            >
              <HiOutlinePencil className="w-5 h-5" />
            </Button>
          </Tooltip>
          <Tooltip label="Delete">
            <Button
              variant="icon"
              onClick={() => onDelete(translation)}
              aria-label={`Delete ${translation.mandarin}`}
              className="text-neutral-500 hover:text-error-600"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {isExpanded && (
        <div id={detailsId} className="animate-fade-in pl-9 pr-1 pb-2 pt-1 space-y-2">
          {translation.pinyin && (
            <div className="text-sm text-neutral-500">{translation.pinyin}</div>
          )}
          <div className="text-base text-neutral-700 break-words">{translation.translation}</div>
          {totalAttempts > 0 && (
            <div className="flex items-center gap-3 text-sm pt-1 border-t border-neutral-200">
              <span className="text-neutral-500">Score:</span>
              <span className="font-medium text-success-600">{correctCount}</span>
              <span className="text-neutral-400">/</span>
              <span className="font-medium text-error-600">{incorrectCount}</span>
              {successRate !== null && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-500">Success rate:</span>
                  <span
                    className={`font-medium ${
                      successRate >= 80
                        ? 'text-success-600'
                        : successRate >= 50
                          ? 'text-neutral-600'
                          : 'text-error-600'
                    }`}
                  >
                    {successRate}%
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
