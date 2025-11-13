import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationCard } from './TranslationCard';
import { Translation } from '../../types';

describe('TranslationCard', () => {
  const mockTranslation: Translation = {
    id: '1',
    mandarin: '你好',
    english: 'Hello',
    pinyin: 'ní hǎo',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders translation data', () => {
    render(
      <TranslationCard translation={mockTranslation} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

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

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('does not render pinyin when not available', () => {
    const translationWithoutPinyin: Translation = {
      id: '2',
      mandarin: '谢谢',
      english: 'Thank you',
    };

    render(
      <TranslationCard
        translation={translationWithoutPinyin}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('谢谢')).toBeInTheDocument();
    expect(screen.getByText('Thank you')).toBeInTheDocument();
    expect(screen.queryByText(/pinyin/i)).not.toBeInTheDocument();
  });
});
