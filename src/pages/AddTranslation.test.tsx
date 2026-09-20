import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastContext';
import AddTranslation from './AddTranslation';
import * as storage from '../utils/translationService';

vi.mock('../utils/translationService');

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('AddTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the form', () => {
    renderWithToast(<AddTranslation />);

    expect(screen.getByRole('heading', { name: /add translation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mandarin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/translation/i)).toBeInTheDocument();
  });

  it('adds translation when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithToast(<AddTranslation />);

    await user.type(screen.getByLabelText(/mandarin/i), '你好');
    await user.type(screen.getByLabelText(/translation/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /add translation/i }));

    await waitFor(() => {
      expect(storage.addTranslation).toHaveBeenCalledWith('你好', 'Hello');
    });
  });

  it('switches to the batch import tab and back', async () => {
    const user = userEvent.setup();
    renderWithToast(<AddTranslation />);

    await user.click(screen.getByRole('button', { name: /batch import/i }));
    expect(screen.getByLabelText(/paste csv data/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /single entry/i }));
    expect(screen.getByLabelText(/mandarin/i)).toBeInTheDocument();
  });

  it('shows the review step after a batch import, and saves it', async () => {
    const user = userEvent.setup();
    renderWithToast(<AddTranslation />);

    await user.click(screen.getByRole('button', { name: /batch import/i }));
    await user.click(screen.getByLabelText(/paste csv data/i));
    await user.paste('你好,Hello\n貓,Cat');
    await user.click(screen.getByRole('button', { name: /import from text/i }));

    expect(await screen.findByDisplayValue('你好')).toBeInTheDocument();

    vi.mocked(storage.addBatchTranslations).mockReturnValue([
      { id: '1', mandarin: '你好', translation: 'Hello' },
      { id: '2', mandarin: '貓', translation: 'Cat' },
    ]);
    await user.click(screen.getByRole('button', { name: /save all/i }));
    expect(await screen.findByText(/successfully imported 2 translation/i)).toBeInTheDocument();
  });

  it('cancels out of the review step', async () => {
    const user = userEvent.setup();
    renderWithToast(<AddTranslation />);

    await user.click(screen.getByRole('button', { name: /batch import/i }));
    await user.click(screen.getByLabelText(/paste csv data/i));
    await user.paste('你好,Hello');
    await user.click(screen.getByRole('button', { name: /import from text/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getByLabelText(/paste csv data/i)).toBeInTheDocument();
  });
});
