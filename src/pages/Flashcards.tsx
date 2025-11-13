import { useState, useEffect, useCallback } from 'react';
import {
  getRandomTranslation,
  getTranslations,
  updateTranslation,
  deleteTranslation,
} from '../utils/storage';
import { getSettings } from '../utils/settings';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';
import { Flashcard } from '../components/features/Flashcard';
import { useToast } from '../contexts/ToastContext';

function Flashcards() {
  const [currentCard, setCurrentCard] = useState(getRandomTranslation());
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardCount, setCardCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeInput, setActiveInput] = useState(getSettings().activeInput);
  const [reverseMode, setReverseMode] = useState(getSettings().reverseMode);
  const [colorCodedCards, setColorCodedCards] = useState(getSettings().colorCodedCards);
  const [sessionScore, setSessionScore] = useState({ correct: 0, incorrect: 0 });
  const { showToast } = useToast();

  // Reset session score on unmount
  useEffect(() => {
    return () => {
      setSessionScore({ correct: 0, incorrect: 0 });
    };
  }, []);

  useEffect(() => {
    // Listen for settings changes
    const handleStorageChange = () => {
      const settings = getSettings();
      setActiveInput(settings.activeInput);
      setReverseMode(settings.reverseMode);
      setColorCodedCards(settings.colorCodedCards);
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case settings change in same window
    const interval = setInterval(() => {
      const settings = getSettings();
      setActiveInput(settings.activeInput);
      setReverseMode(settings.reverseMode);
      setColorCodedCards(settings.colorCodedCards);
    }, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadRandomCard = useCallback(() => {
    const card = getRandomTranslation();
    setCurrentCard(card);
    setShowAnswer(false);
    if (card) {
      setCardCount(prev => prev + 1);
    }
  }, []);

  const handleEdit = useCallback(
    (id: string, mandarin: string, translation: string) => {
      if (!mandarin.trim() || !translation.trim()) {
        showToast('error', 'Please fill in both fields');
        return;
      }

      if (updateTranslation(id, mandarin.trim(), translation.trim())) {
        showToast('success', 'Translation updated successfully!');
        // Reload the current card if it's the one being edited
        if (currentCard && currentCard.id === id) {
          const translations = getTranslations();
          const updatedCard = translations.find(t => t.id === id);
          if (updatedCard) {
            setCurrentCard(updatedCard);
          }
        }
      } else {
        showToast('error', 'Failed to update translation');
      }
    },
    [currentCard, showToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (deleteTranslation(id)) {
        showToast('success', 'Translation deleted successfully!');
        // If the deleted card is the current card, load a new one
        if (currentCard && currentCard.id === id) {
          loadRandomCard();
        }
      } else {
        showToast('error', 'Failed to delete translation');
      }
    },
    [currentCard, loadRandomCard, showToast]
  );

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
      // Don't handle Enter if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        if (showAnswer) {
          handleNext();
        } else if (!activeInput) {
          // Only auto-reveal if active input is disabled
          handleReveal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showAnswer, handleNext, handleReveal, activeInput]);

  const handleScoreUpdate = useCallback((correct: boolean) => {
    setSessionScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
  }, []);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-neutral-500">
          <div>
            Card #{cardCount} • {translations.length} total
          </div>
          {activeInput && (sessionScore.correct > 0 || sessionScore.incorrect > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-success-600 font-medium">{sessionScore.correct}</span>
              <span className="text-neutral-400">/</span>
              <span className="text-error-600 font-medium">{sessionScore.incorrect}</span>
            </div>
          )}
        </div>
      </div>

      {currentCard ? (
        <Flashcard
          card={currentCard}
          showAnswer={showAnswer}
          onReveal={handleReveal}
          onNext={handleNext}
          isTransitioning={isTransitioning}
          onEdit={handleEdit}
          onDelete={handleDelete}
          activeInput={activeInput}
          reverseMode={reverseMode}
          colorCodedCards={colorCodedCards}
          onScoreUpdate={handleScoreUpdate}
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
