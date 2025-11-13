import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastContext';
import ListTranslations from './ListTranslations';
import * as storage from '../utils/storage';
import { Translation } from '../types';

vi.mock('../utils/storage');

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('ListTranslations', () => {
  const mockTranslations: Translation[] = [
    { id: '1', mandarin: '你好', translation: 'Hello', pinyin: 'ní hǎo' },
    { id: '2', mandarin: '谢谢', translation: 'Thank you', pinyin: 'xiè xie' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getTranslations).mockReturnValue(mockTranslations);
    vi.mocked(storage.updateTranslation).mockReturnValue(true);
    vi.mocked(storage.deleteTranslation).mockReturnValue(true);
  });

  it('renders all translations', () => {
    renderWithToast(<ListTranslations />);

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('谢谢')).toBeInTheDocument();
    expect(screen.getByText('Thank you')).toBeInTheDocument();
  });

  it('shows empty state when no translations', () => {
    vi.mocked(storage.getTranslations).mockReturnValue([]);
    renderWithToast(<ListTranslations />);

    expect(screen.getByText(/no translations saved yet/i)).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithToast(<ListTranslations />);

    const editButtons = screen.getAllByLabelText(/edit translation/i);
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue('你好')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('saves translation when save button is clicked', async () => {
    const user = userEvent.setup();
    renderWithToast(<ListTranslations />);

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
    renderWithToast(<ListTranslations />);

    const editButtons = screen.getAllByLabelText(/edit translation/i);
    await user.click(editButtons[0]);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByDisplayValue('你好')).not.toBeInTheDocument();
    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('deletes translation when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithToast(<ListTranslations />);

    const deleteButtons = screen.getAllByLabelText(/delete translation/i);
    await user.click(deleteButtons[0]);

    // Confirm modal should appear
    expect(screen.getByText(/delete translation/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Click delete button in modal - use getAllByRole and filter for the one in the modal
    const allDeleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // The last one should be the confirm button in the modal
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1];
    await user.click(confirmButton);

    await waitFor(() => {
      expect(storage.deleteTranslation).toHaveBeenCalledWith('1');
    });
  });
});
