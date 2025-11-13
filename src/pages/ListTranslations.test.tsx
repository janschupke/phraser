import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListTranslations from './ListTranslations';
import * as storage from '../utils/storage';
import { Translation } from '../types';

vi.mock('../utils/storage');

describe('ListTranslations', () => {
  const mockTranslations: Translation[] = [
    { id: '1', mandarin: '你好', english: 'Hello', pinyin: 'ní hǎo' },
    { id: '2', mandarin: '谢谢', english: 'Thank you', pinyin: 'xiè xie' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getTranslations).mockReturnValue(mockTranslations);
    vi.mocked(storage.updateTranslation).mockReturnValue(true);
    vi.mocked(storage.deleteTranslation).mockReturnValue(true);
    window.confirm = vi.fn(() => true);
  });

  it('renders all translations', () => {
    render(<ListTranslations />);

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('谢谢')).toBeInTheDocument();
    expect(screen.getByText('Thank you')).toBeInTheDocument();
  });

  it('shows empty state when no translations', () => {
    vi.mocked(storage.getTranslations).mockReturnValue([]);
    render(<ListTranslations />);

    expect(screen.getByText(/no translations saved yet/i)).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ListTranslations />);

    const editButtons = screen.getAllByLabelText(/edit translation/i);
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue('你好')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('saves translation when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<ListTranslations />);

    const editButtons = screen.getAllByLabelText(/edit translation/i);
    await user.click(editButtons[0]);

    const mandarinInput = screen.getByDisplayValue('你好');
    await user.clear(mandarinInput);
    await user.type(mandarinInput, '你好吗');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(storage.updateTranslation).toHaveBeenCalledWith('1', '你好吗', 'Hello');
    });
  });

  it('cancels edit when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ListTranslations />);

    const editButtons = screen.getAllByLabelText(/edit translation/i);
    await user.click(editButtons[0]);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByDisplayValue('你好')).not.toBeInTheDocument();
    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('deletes translation when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<ListTranslations />);

    const deleteButtons = screen.getAllByLabelText(/delete translation/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(storage.deleteTranslation).toHaveBeenCalledWith('1');
    });
  });
});
