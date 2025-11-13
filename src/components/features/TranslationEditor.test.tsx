import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationEditor } from './TranslationEditor';
import { Translation } from '../../types';

describe('TranslationEditor', () => {
  const mockTranslation: Translation = {
    id: '1',
    mandarin: '你好',
    english: 'Hello',
    pinyin: 'ní hǎo',
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  it('renders with translation values', () => {
    render(
      <TranslationEditor
        translation={mockTranslation}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/mandarin/i)).toHaveValue('你好');
    expect(screen.getByLabelText(/english translation/i)).toHaveValue('Hello');
  });

  it('calls onSave with updated values when save is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TranslationEditor
        translation={mockTranslation}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const mandarinInput = screen.getByLabelText(/mandarin/i);
    const englishInput = screen.getByLabelText(/english translation/i);

    await user.clear(mandarinInput);
    await user.type(mandarinInput, '你好吗');
    await user.clear(englishInput);
    await user.type(englishInput, 'How are you');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', '你好吗', 'How are you');
    });
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TranslationEditor
        translation={mockTranslation}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('updates values when translation prop changes', () => {
    const { rerender } = render(
      <TranslationEditor
        translation={mockTranslation}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const newTranslation: Translation = {
      id: '2',
      mandarin: '谢谢',
      english: 'Thank you',
    };

    rerender(
      <TranslationEditor translation={newTranslation} onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/mandarin/i)).toHaveValue('谢谢');
    expect(screen.getByLabelText(/english translation/i)).toHaveValue('Thank you');
  });
});
