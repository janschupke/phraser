import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTranslation from './AddTranslation';
import * as storage from '../utils/storage';

vi.mock('../utils/storage');

describe('AddTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the form', () => {
    render(<AddTranslation />);

    expect(screen.getByRole('heading', { name: /add translation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mandarin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/english translation/i)).toBeInTheDocument();
  });

  it('adds translation when form is submitted', async () => {
    const user = userEvent.setup();
    render(<AddTranslation />);

    await user.type(screen.getByLabelText(/mandarin/i), '你好');
    await user.type(screen.getByLabelText(/english translation/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /add translation/i }));

    await waitFor(() => {
      expect(storage.addTranslation).toHaveBeenCalledWith('你好', 'Hello');
    });
  });
});
