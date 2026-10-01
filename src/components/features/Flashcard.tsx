import { useState, useEffect, useCallback, useRef } from 'react';
import { HiOutlineCog } from 'react-icons/hi';
import type { Translation } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Input } from '../ui/Input';
import { useHotkeys } from '../../hooks/useHotkeys';
import { validateTranslation } from '../../utils/stringComparison';
import { recordCorrectAnswer, recordIncorrectAnswer } from '../../utils/translationService';
import { FlashcardFace } from './FlashcardFace';
import { TranslationEditor } from './TranslationEditor';
import { Tooltip } from '../ui/Tooltip';

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
  colorCodedCards?: boolean;
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
  colorCodedCards = true,
  onScoreUpdate,
}: FlashcardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  // Guards against double-recording under StrictMode's double-invoked effects.
  const recordedForCardRef = useRef<string | null>(null);

  // Resolve the orientation once, so the markup below does not branch on it.
  const prompt = reverseMode ? card.translation : card.mandarin;
  const answer = reverseMode ? card.mandarin : card.translation;
  const promptLabel = reverseMode ? 'Translation' : 'Mandarin';
  const answerLabel = reverseMode ? 'Mandarin' : 'Translation';

  useEffect(() => {
    setUserInput('');
    setIsCorrect(null);
    recordedForCardRef.current = null;
  }, [card.id]);

  useEffect(() => {
    if (activeInput && !showAnswer) {
      answerInputRef.current?.focus();
    }
  }, [activeInput, showAnswer, card.id]);

  // Grade once per reveal, when active input is on.
  useEffect(() => {
    if (!showAnswer || !activeInput) return;
    if (recordedForCardRef.current === card.id) return;
    recordedForCardRef.current = card.id;

    const correct = validateTranslation(userInput, answer);
    setIsCorrect(correct);
    if (correct) {
      recordCorrectAnswer(card.id);
    } else {
      recordIncorrectAnswer(card.id);
    }
    onScoreUpdate?.(correct);
  }, [showAnswer, activeInput, card.id, answer, userInput, onScoreUpdate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }, []);

  const handleSave = useCallback(
    (id: string, mandarin: string, translation: string) => {
      onEdit?.(id, mandarin, translation);
      setIsEditing(false);
    },
    [onEdit]
  );

  const handleDeleteConfirm = useCallback(() => {
    onDelete?.(card.id);
    setShowDeleteConfirm(false);
    setIsEditing(false);
  }, [card.id, onDelete]);

  // Space mirrors Enter exactly. Both are ignored while editing, and while the
  // caret is in a text field -- which is what lets Space type a literal space
  // in the answer box, and keeps a pinyin IME's candidate-commit working.
  const advance = useCallback(() => {
    if (showAnswer) {
      onNext();
    } else {
      onReveal();
    }
  }, [showAnswer, onNext, onReveal]);

  useHotkeys({ Enter: advance, Space: advance }, { enabled: !isEditing && !showDeleteConfirm });

  const actionLabel = showAnswer ? 'Next card' : activeInput ? 'Check answer' : 'Reveal answer';

  return (
    <>
      <Card
        className={`p-6 sm:p-10 flex-1 min-h-0 flex flex-col transform-gpu relative overflow-hidden ${
          isTransitioning ? 'animate-flip-out' : 'animate-flip-in'
        } ${
          showAnswer && activeInput && isCorrect !== null && colorCodedCards
            ? isCorrect
              ? 'bg-success-200 border-success-400'
              : 'bg-error-200 border-error-400'
            : ''
        } transition-colors duration-300`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {!isEditing && (
          <Tooltip label="Edit flashcard">
            <Button
              variant="icon"
              onClick={() => setIsEditing(true)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-primary-600 z-10"
              aria-label="Edit flashcard"
            >
              <HiOutlineCog className="w-6 h-6" />
            </Button>
          </Tooltip>
        )}

        {isEditing ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <TranslationEditor
              translation={card}
              title="Edit Translation"
              onSave={handleSave}
              onCancel={handleCancel}
              {...(onDelete ? { onDelete: () => setShowDeleteConfirm(true) } : {})}
            />
          </div>
        ) : (
          <>
            {/*
              The scroller, so a long phrase scrolls inside the card instead of
              growing the page. Centring is via my-auto on the child rather than
              justify-center here: justify-center on a scroll container clips the
              top of overflowing content and makes it unreachable.
            */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex">
              <FlashcardFace
                prompt={prompt}
                promptLabel={promptLabel}
                answer={answer}
                answerLabel={answerLabel}
                pinyin={card.pinyin}
                showAnswer={showAnswer}
                promptLang={reverseMode ? undefined : 'zh-Hans'}
                answerLang={reverseMode ? 'zh-Hans' : undefined}
              />
            </div>

            <div className="shrink-0 pt-4 mt-4 border-t border-neutral-200 space-y-3">
              {activeInput && !showAnswer && (
                <Input
                  ref={answerInputRef}
                  id={`translation-input-${card.id}`}
                  label={reverseMode ? 'Enter Mandarin' : 'Enter Translation'}
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder={
                    reverseMode ? 'Type Mandarin here...' : 'Type your translation here...'
                  }
                />
              )}

              {showAnswer && activeInput && isCorrect !== null && (
                <div>
                  <div
                    className={`text-lg font-semibold ${
                      isCorrect ? 'text-success-700' : 'text-error-700'
                    }`}
                  >
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  {!isCorrect && userInput.trim() && (
                    <div className="text-sm text-error-600 mt-1">
                      Your answer: &quot;{userInput}&quot;
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <Button variant="primary" onClick={advance} className="px-8 py-3">
                  {showAnswer ? 'Next Card' : actionLabel}
                </Button>
                <span className="text-sm text-neutral-500">Enter or Space</span>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Translation"
        message={`Are you sure you want to delete "${card.mandarin}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
