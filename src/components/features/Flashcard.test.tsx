import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flashcard } from './Flashcard';
import { Translation } from '../../types';

describe('Flashcard', () => {
  const mockCard: Translation = {
    id: '1',
    mandarin: '你好',
    english: 'Hello',
    pinyin: 'ní hǎo',
  };

  const mockOnReveal = vi.fn();
  const mockOnNext = vi.fn();

  it('renders mandarin text', () => {
    render(
      <Flashcard card={mockCard} showAnswer={false} onReveal={mockOnReveal} onNext={mockOnNext} />
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('does not show answer initially', () => {
    render(
      <Flashcard card={mockCard} showAnswer={false} onReveal={mockOnReveal} onNext={mockOnNext} />
    );

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('ní hǎo')).not.toBeInTheDocument();
  });

  it('shows answer when showAnswer is true', () => {
    render(
      <Flashcard card={mockCard} showAnswer={true} onReveal={mockOnReveal} onNext={mockOnNext} />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('ní hǎo')).toBeInTheDocument();
  });

  it('calls onReveal when reveal button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Flashcard card={mockCard} showAnswer={false} onReveal={mockOnReveal} onNext={mockOnNext} />
    );

    const revealButton = screen.getByText(/click to reveal/i);
    await user.click(revealButton);

    expect(mockOnReveal).toHaveBeenCalled();
  });

  it('calls onNext when next button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Flashcard card={mockCard} showAnswer={true} onReveal={mockOnReveal} onNext={mockOnNext} />
    );

    const nextButton = screen.getByText(/next card/i);
    await user.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('does not show pinyin when not available', () => {
    const cardWithoutPinyin: Translation = {
      id: '2',
      mandarin: '谢谢',
      english: 'Thank you',
    };

    render(
      <Flashcard
        card={cardWithoutPinyin}
        showAnswer={true}
        onReveal={mockOnReveal}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByText('Thank you')).toBeInTheDocument();
    expect(screen.queryByText(/pinyin/i)).not.toBeInTheDocument();
  });
});
