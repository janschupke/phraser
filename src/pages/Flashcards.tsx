import { useState, useEffect, useCallback } from 'react';
import { getRandomTranslation, getTranslations } from '../utils/storage';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { Flashcard } from '../components/features/Flashcard';

function Flashcards() {
  const [currentCard, setCurrentCard] = useState(getRandomTranslation());
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardCount, setCardCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadRandomCard = useCallback(() => {
    const card = getRandomTranslation();
    setCurrentCard(card);
    setShowAnswer(false);
    if (card) {
      setCardCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!currentCard) {
      loadRandomCard();
    }
  }, [currentCard, loadRandomCard]);

  const handleReveal = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      loadRandomCard();
      setIsTransitioning(false);
    }, 150);
  }, [loadRandomCard]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showAnswer) {
          handleNext();
        } else {
          handleReveal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showAnswer, handleNext, handleReveal]);

  const translations = getTranslations();
  const hasTranslations = translations.length > 0;

  if (!hasTranslations) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <PageTitle>Flashcards</PageTitle>
        <Card className="p-8 sm:p-12">
          <p className="text-neutral-600 text-lg sm:text-xl mb-4">No translations available yet.</p>
          <p className="text-neutral-500">Add some translations to start practicing!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto page-transition-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6">
        <PageTitle className="mb-0">Flashcards</PageTitle>
        <div className="text-sm text-neutral-500">
          Card #{cardCount} • {translations.length} total
        </div>
      </div>

      {currentCard ? (
        <Flashcard
          card={currentCard}
          showAnswer={showAnswer}
          onReveal={handleReveal}
          onNext={handleNext}
          isTransitioning={isTransitioning}
        />
      ) : (
        <Card className="p-8 sm:p-12 animate-fade-in">
          <p className="text-neutral-500 text-center">Loading...</p>
        </Card>
      )}
    </div>
  );
}

export default Flashcards;
