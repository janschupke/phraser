import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationCard } from './TranslationCard';
import type { Translation } from '../../types';

describe('TranslationCard', () => {
  const mockTranslation: Translation = {
    id: '1',
    mandarin: '你好',
    translation: 'Hello',
    pinyin: 'ní hǎo',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const renderCard = (translation = mockTranslation, showSecondary = false) =>
    render(
      <TranslationCard
        translation={translation}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        showSecondary={showSecondary}
      />
    );

  // The row header is a disclosure button named by the Mandarin it reveals, so
  // it needs no aria-label of its own -- adding one would override the visible
  // text, which is an accessibility anti-pattern.
  const disclosure = (): HTMLElement => {
    const button = screen
      .getAllByRole('button')
      .find(candidate => candidate.hasAttribute('aria-expanded'));
    if (!button) throw new Error('no disclosure button found');
    return button;
  };

  it('shows only the mandarin when collapsed', () => {
    renderCard();
    expect(disclosure()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('shows the translation when expanded', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(disclosure());

    expect(disclosure()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('ní hǎo')).toBeInTheDocument();
  });

  it('collapses again', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(disclosure());
    await user.click(disclosure());

    expect(disclosure()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('shows the translation on the collapsed row while searching', () => {
    // Otherwise a search matched by English returns rows showing only Mandarin,
    // and every hit has to be expanded to check it.
    renderCard(mockTranslation, true);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('exposes the details panel to the disclosure button', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(disclosure());

    const controls = disclosure().getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).toBeInTheDocument();
  });

  it('renders no pinyin when there is none', () => {
    renderCard({ id: '2', mandarin: '猫', translation: 'Cat' });
    expect(screen.queryByText('ní hǎo')).not.toBeInTheDocument();
  });

  it('calls onEdit and onDelete from their own buttons', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: /edit 你好/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTranslation);

    await user.click(screen.getByRole('button', { name: /delete 你好/i }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTranslation);
  });

  it('does not nest the action buttons inside the disclosure button', () => {
    // Nested interactive content is invalid HTML and was why the old row needed
    // stopPropagation on every action.
    renderCard();
    expect(disclosure()).not.toContainElement(screen.getByRole('button', { name: /edit 你好/i }));
  });
});
