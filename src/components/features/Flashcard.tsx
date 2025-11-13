import { useState, useEffect, useRef, useCallback } from 'react';
import { Translation } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { HiOutlineCog, HiOutlineTrash } from 'react-icons/hi';
import { validateTranslation } from '../../utils/stringComparison';
import { recordCorrectAnswer, recordIncorrectAnswer } from '../../utils/storage';

interface FlashcardProps {
  card: Translation;
  showAnswer: boolean;
  onReveal: () => void;
  onNext: () => void;
  isTransitioning?: boolean;
  onEdit?: (id: string, mandarin: string, translation: string) => void;
  onDelete?: (id: string) => void;
  activeInput?: boolean;
  reverseMode?: boolean;
  onScoreUpdate?: (correct: boolean) => void;
}

export function Flashcard({
  card,
  showAnswer,
  onReveal,
  onNext,
  isTransitioning = false,
  onEdit,
  onDelete,
  activeInput = false,
  reverseMode = false,
  onScoreUpdate,
}: FlashcardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mandarin, setMandarin] = useState(card.mandarin);
  const [translationText, setTranslationText] = useState(card.translation);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasRecordedScore, setHasRecordedScore] = useState(false);
  const mandarinInputRef = useRef<HTMLInputElement>(null);
  const translationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && mandarinInputRef.current) {
      setTimeout(() => {
        mandarinInputRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);

  useEffect(() => {
    setMandarin(card.mandarin);
    setTranslationText(card.translation);
    setUserInput('');
    setIsCorrect(null);
    setHasRecordedScore(false);
  }, [card]);

  useEffect(() => {
    if (activeInput && translationInputRef.current && !showAnswer) {
      setTimeout(() => {
        translationInputRef.current?.focus();
      }, 100);
    }
  }, [activeInput, showAnswer, card]);

  useEffect(() => {
    if (showAnswer && activeInput && !hasRecordedScore) {
      // Validate even if input is empty (empty is considered incorrect)
      // In reverse mode, compare user input (Mandarin) with card.mandarin
      // In normal mode, compare user input (translation) with card.translation
      const correct = reverseMode
        ? validateTranslation(userInput, card.mandarin)
        : validateTranslation(userInput, card.translation);
      setIsCorrect(correct);
      
      // Record score only once per reveal when active input is enabled
      if (correct) {
        recordCorrectAnswer(card.id);
      } else {
        recordIncorrectAnswer(card.id);
      }
      
      // Notify parent component of score update
      if (onScoreUpdate) {
        onScoreUpdate(correct);
      }
      
      setHasRecordedScore(true);
    } else if (!showAnswer) {
      setIsCorrect(null);
      setHasRecordedScore(false);
    }
  }, [showAnswer, userInput, card.translation, card.mandarin, card.id, activeInput, reverseMode, hasRecordedScore, onScoreUpdate]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = useCallback(() => {
    if (!mandarin.trim() || !translationText.trim()) {
      return;
    }
    if (onEdit) {
      onEdit(card.id, mandarin.trim(), translationText.trim());
    }
    setIsEditing(false);
  }, [mandarin, translationText, card.id, onEdit]);

  const handleCancel = () => {
    setMandarin(card.mandarin);
    setTranslationText(card.translation);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(card.id);
    }
    setShowDeleteConfirm(false);
    setIsEditing(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on the configure icon or its parent button
    if ((e.target as HTMLElement).closest('button[aria-label="Edit flashcard"]')) {
      return;
    }
    // Don't trigger if clicking on the next button
    if ((e.target as HTMLElement).closest('button[class*="px-8"]')) {
      return;
    }
    // Don't trigger if clicking on input fields when active input is enabled
    if (activeInput && (e.target as HTMLElement).closest('input')) {
      return;
    }
    
    if (!isEditing && !showAnswer) {
      onReveal();
    } else if (!isEditing && showAnswer && !activeInput) {
      onNext();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAnswer) {
      e.preventDefault();
      onReveal();
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={!isEditing ? 'cursor-pointer' : ''}
      >
        <Card
          className={`p-8 sm:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center transform-gpu relative ${
            isTransitioning ? 'animate-flip-out' : 'animate-flip-in'
          } ${
            !isEditing
              ? 'hover:shadow-lg transition-shadow duration-200'
              : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
        {/* Configure Icon */}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-primary-600 transition-colors duration-200 z-10"
            aria-label="Edit flashcard"
            title="Edit flashcard"
          >
            <HiOutlineCog className="w-6 h-6" />
          </button>
        )}

        {isEditing ? (
          <form onSubmit={handleFormSubmit} className="w-full space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Edit Translation</h3>
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors duration-200"
                  aria-label="Delete translation"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              )}
            </div>

            <Input
              ref={mandarinInputRef}
              id={`flashcard-mandarin-${card.id}`}
              label="Mandarin (中文)"
              value={mandarin}
              onChange={e => setMandarin(e.target.value)}
              className="text-base"
            />
            <Input
              id={`flashcard-translation-${card.id}`}
              label="Translation"
              value={translationText}
              onChange={e => setTranslationText(e.target.value)}
              className="text-base"
            />
            <div className="flex gap-3">
              <Button type="submit" variant="success" className="px-5 py-2.5">
                Save
              </Button>
              <Button type="button" variant="neutral" onClick={handleCancel} className="px-5 py-2.5">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-center mb-8 w-full">
              <div className="mb-6">
                <div className="text-sm text-neutral-500 mb-3">
                  {reverseMode ? 'Translation' : 'Mandarin'}
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-neutral-800 break-words">
                  {reverseMode ? card.translation : card.mandarin}
                </div>
              </div>

              {activeInput ? (
                <>
                  {!showAnswer ? (
                    <div className="mt-8 pt-8 border-t border-neutral-200 w-full">
                      <div className="mb-4">
                        <label htmlFor={`translation-input-${card.id}`} className="block text-sm font-medium text-neutral-700 mb-2">
                          {reverseMode ? 'Enter Mandarin' : 'Enter Translation'}
                        </label>
                        <Input
                          ref={translationInputRef}
                          id={`translation-input-${card.id}`}
                          value={userInput}
                          onChange={(e) => {
                            e.stopPropagation();
                            setUserInput(e.target.value);
                          }}
                          onKeyDown={handleInputKeyDown}
                          placeholder={reverseMode ? "Type Mandarin here..." : "Type your translation here..."}
                          className="text-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-xs text-neutral-500 mt-2">
                          Press Enter to check your answer
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-neutral-200 w-full animate-fade-in">
                      {reverseMode ? (
                        <>
                          {card.pinyin && (
                            <div className="mb-4">
                              <div className="text-sm text-neutral-500 mb-2">Pinyin</div>
                              <div className="text-xl sm:text-2xl text-neutral-600 font-normal break-words">
                                {card.pinyin}
                              </div>
                            </div>
                          )}
                          <div className="mb-4">
                            <div className="text-sm text-neutral-500 mb-2">Correct Answer</div>
                            <div className="text-2xl sm:text-3xl text-neutral-700 break-words">
                              {card.mandarin}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {card.pinyin && (
                            <div className="mb-4">
                              <div className="text-sm text-neutral-500 mb-2">Pinyin</div>
                              <div className="text-xl sm:text-2xl text-neutral-600 font-normal break-words">
                                {card.pinyin}
                              </div>
                            </div>
                          )}
                          <div className="mb-4">
                            <div className="text-sm text-neutral-500 mb-2">Correct Answer</div>
                            <div className="text-2xl sm:text-3xl text-neutral-700 break-words">
                              {card.translation}
                            </div>
                          </div>
                        </>
                      )}
                      {isCorrect !== null && (
                        <div className={`mt-4 p-4 rounded-lg ${
                          isCorrect 
                            ? 'bg-success-50 border-2 border-success-500' 
                            : 'bg-error-50 border-2 border-error-500'
                        }`}>
                          <div className={`text-lg font-semibold ${
                            isCorrect ? 'text-success-700' : 'text-error-700'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </div>
                          {!isCorrect && userInput.trim() && (
                            <div className="text-sm text-error-600 mt-2">
                              Your answer: "{userInput}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {showAnswer ? (
                    <div className="mt-8 pt-8 border-t border-neutral-200 w-full animate-fade-in">
                      {reverseMode ? (
                        <>
                          {card.pinyin && (
                            <div className="mb-6">
                              <div className="text-sm text-neutral-500 mb-2">Pinyin</div>
                              <div className="text-xl sm:text-2xl text-neutral-600 font-normal break-words">
                                {card.pinyin}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-neutral-500 mb-2">Mandarin</div>
                            <div className="text-2xl sm:text-3xl text-neutral-700 break-words">
                              {card.mandarin}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {card.pinyin && (
                            <div className="mb-6">
                              <div className="text-sm text-neutral-500 mb-2">Pinyin</div>
                              <div className="text-xl sm:text-2xl text-neutral-600 font-normal break-words">
                                {card.pinyin}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-neutral-500 mb-2">Translation</div>
                            <div className="text-2xl sm:text-3xl text-neutral-700 break-words">
                              {card.translation}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-neutral-200">
                      <div className="text-primary-600 font-medium text-base sm:text-lg transition-colors duration-200">
                        Click anywhere to reveal answer (or press Enter)
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {showAnswer && (
              <div className="flex gap-4 mt-8 animate-fade-in">
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="px-8 py-3"
                >
                  Next Card (or press Enter)
                </Button>
              </div>
            )}
            {activeInput && !showAnswer && (
              <div className="flex gap-4 mt-4">
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReveal();
                  }}
                  className="px-8 py-3"
                >
                  Check Answer (or press Enter)
                </Button>
              </div>
            )}
          </>
        )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Delete Translation</h2>
            <p className="text-neutral-700 mb-6">
              Are you sure you want to delete "{card.mandarin}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="neutral" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-error-600 text-white hover:bg-error-700 focus:ring-error-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
