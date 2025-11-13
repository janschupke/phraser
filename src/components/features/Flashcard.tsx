import { Translation } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface FlashcardProps {
  card: Translation;
  showAnswer: boolean;
  onReveal: () => void;
  onNext: () => void;
  isTransitioning?: boolean;
}

export function Flashcard({
  card,
  showAnswer,
  onReveal,
  onNext,
  isTransitioning = false,
}: FlashcardProps) {
  return (
    <Card
      className={`p-8 sm:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center transform-gpu ${
        isTransitioning ? 'animate-flip-out' : 'animate-flip-in'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="text-center mb-8 w-full">
        <div className="mb-6">
          <div className="text-sm text-neutral-500 mb-3">Mandarin</div>
          <div className="text-4xl sm:text-5xl font-bold text-neutral-800 break-words">
            {card.mandarin}
          </div>
        </div>

        {showAnswer ? (
          <div className="mt-8 pt-8 border-t border-neutral-200 w-full animate-fade-in">
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
          </div>
        ) : (
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <button
              onClick={onReveal}
              className="text-primary-600 hover:text-primary-700 font-medium text-base sm:text-lg transition-colors duration-200"
            >
              Click to reveal answer (or press Enter)
            </button>
          </div>
        )}
      </div>

      {showAnswer && (
        <div className="flex gap-4 mt-8 animate-fade-in">
          <Button variant="primary" onClick={onNext} className="px-8 py-3">
            Next Card (or press Enter)
          </Button>
        </div>
      )}
    </Card>
  );
}
