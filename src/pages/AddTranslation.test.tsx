import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastContext';
import AddTranslation from './AddTranslation';
import * as storage from '../utils/storage';

vi.mock('../utils/storage');

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
});
