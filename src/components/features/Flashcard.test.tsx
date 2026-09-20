import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flashcard } from './Flashcard';
import type { Translation } from '../../types';

describe('Flashcard', () => {
  const mockCard: Translation = {
    id: '1',
    mandarin: '你好',
    translation: 'Hello',
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

  it('reveals via the action button', async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    render(
      <Flashcard card={mockCard} showAnswer={false} onReveal={onReveal} onNext={mockOnNext} />
    );

    await user.click(screen.getByRole('button', { name: /reveal answer/i }));
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it('advances via the action button once the answer is shown', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Flashcard card={mockCard} showAnswer={true} onReveal={mockOnReveal} onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: /next card/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('reveals on Space and on Enter', async () => {
    const user = userEvent.setup();
    for (const key of [' ', '{Enter}']) {
      const onReveal = vi.fn();
      const { unmount } = render(
        <Flashcard card={mockCard} showAnswer={false} onReveal={onReveal} onNext={mockOnNext} />
      );
      await user.keyboard(key);
      expect(onReveal, key).toHaveBeenCalledOnce();
      unmount();
    }
  });

  it('advances on Space and on Enter once the answer is shown', async () => {
    const user = userEvent.setup();
    for (const key of [' ', '{Enter}']) {
      const onNext = vi.fn();
      const { unmount } = render(
        <Flashcard card={mockCard} showAnswer={true} onReveal={mockOnReveal} onNext={onNext} />
      );
      await user.keyboard(key);
      expect(onNext, key).toHaveBeenCalledOnce();
      unmount();
    }
  });

  it('advances exactly once when the action button has focus', async () => {
    // The button activates natively on Space/Enter; the hotkey must stand down
    // or the card advances twice and one is skipped.
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Flashcard card={mockCard} showAnswer={true} onReveal={mockOnReveal} onNext={onNext} />);

    screen.getByRole('button', { name: /next card/i }).focus();
    await user.keyboard(' ');
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('lets Space type a space in the answer field instead of revealing', async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    render(
      <Flashcard
        card={mockCard}
        showAnswer={false}
        onReveal={onReveal}
        onNext={mockOnNext}
        activeInput
      />
    );

    const field = screen.getByLabelText(/enter translation/i);
    await user.click(field);
    await user.type(field, 'hello there');

    expect(field).toHaveValue('hello there');
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('does not react to Space or Enter while editing', async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    render(
      <Flashcard
        card={mockCard}
        showAnswer={false}
        onReveal={onReveal}
        onNext={mockOnNext}
        onEdit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await user.keyboard('{Enter}');
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('does not show pinyin when not available', () => {
    const cardWithoutPinyin: Translation = {
      id: '2',
      mandarin: '谢谢',
      translation: 'Thank you',
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
