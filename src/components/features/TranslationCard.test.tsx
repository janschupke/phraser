import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationCard } from './TranslationCard';
import { Translation } from '../../types';

describe('TranslationCard', () => {
  const mockTranslation: Translation = {
    id: '1',
    mandarin: '你好',
    translation: 'Hello',
    pinyin: 'ní hǎo',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders mandarin in collapsed state', () => {
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    // Translation and pinyin should not be visible when collapsed
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('ní hǎo')).not.toBeInTheDocument();
  });

  it('shows full details when expanded', async () => {
    const user = userEvent.setup();
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Expand the card
    const expandButton = screen.getByLabelText(/expand/i);
    await user.click(expandButton);

    // Now all details should be visible
    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('ní hǎo')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByLabelText(/edit translation/i);
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTranslation);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByLabelText(/delete translation/i);
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTranslation);
  });

  it('does not render pinyin when not available', async () => {
    const user = userEvent.setup();
    const translationWithoutPinyin: Translation = {
      id: '2',
      mandarin: '谢谢',
      translation: 'Thank you',
    };

    render(
      <TranslationCard
        translation={translationWithoutPinyin}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('谢谢')).toBeInTheDocument();
    // Translation should not be visible when collapsed
    expect(screen.queryByText('Thank you')).not.toBeInTheDocument();

    // Expand to see translation
    const expandButton = screen.getByLabelText(/expand/i);
    await user.click(expandButton);

    expect(screen.getByText('Thank you')).toBeInTheDocument();
    expect(screen.queryByText(/pinyin/i)).not.toBeInTheDocument();
  });

  it('can collapse after expanding', async () => {
    const user = userEvent.setup();
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Expand
    const expandButton = screen.getByLabelText(/expand/i);
    await user.click(expandButton);
    expect(screen.getByText('Hello')).toBeInTheDocument();

    // Collapse
    const collapseButton = screen.getByLabelText(/collapse/i);
    await user.click(collapseButton);
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });
});
