interface FlashcardFaceProps {
  prompt: string;
  promptLabel: string;
  answer: string;
  answerLabel: string;
  pinyin: string | undefined;
  showAnswer: boolean;
  /** Set for the Mandarin side so screen readers and font fallback get it right. */
  promptLang?: string | undefined;
  answerLang?: string | undefined;
}

/**
 * The prompt/answer pair.
 *
 * Which of mandarin and translation is the prompt depends on reverse mode, but
 * the markup does not -- the caller resolves that once. Previously both
 * orientations were written out in full, four near-identical JSX branches that
 * had to be kept in step by hand.
 */
export function FlashcardFace({
  prompt,
  promptLabel,
  answer,
  answerLabel,
  pinyin,
  showAnswer,
  promptLang,
  answerLang,
}: FlashcardFaceProps) {
  return (
    <div className="text-center w-full my-auto">
      <div>
        <div className="text-sm text-neutral-500 mb-3">{promptLabel}</div>
        <div
          lang={promptLang}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 break-words"
        >
          {prompt}
        </div>
      </div>

      {showAnswer && (
        <div className="mt-6 pt-6 border-t border-neutral-200 w-full animate-fade-in">
          {pinyin && (
            <div className="mb-4">
              <div className="text-sm text-neutral-500 mb-2">Pinyin</div>
              <div className="text-lg sm:text-xl text-neutral-600 break-words">{pinyin}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-neutral-500 mb-2">{answerLabel}</div>
            <div lang={answerLang} className="text-2xl sm:text-3xl text-neutral-700 break-words">
              {answer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
