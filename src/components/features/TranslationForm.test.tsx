import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../../contexts/ToastContext';
import { TranslationForm } from './TranslationForm';

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('TranslationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with inputs and submit button', () => {
    renderWithToast(<TranslationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/mandarin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/english translation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add translation/i })).toBeInTheDocument();
  });

  it('calls onSubmit with trimmed values when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithToast(<TranslationForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/mandarin/i), '  你好  ');
    await user.type(screen.getByLabelText(/english translation/i), '  Hello  ');
    await user.click(screen.getByRole('button', { name: /add translation/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('你好', 'Hello');
    });
  });

  it('shows error message when fields are empty', async () => {
    const user = userEvent.setup();
    renderWithToast(<TranslationForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /add translation/i }));

    expect(await screen.findByText(/please fill in both fields/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    renderWithToast(<TranslationForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/mandarin/i), '你好');
    await user.type(screen.getByLabelText(/english translation/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /add translation/i }));

    expect(await screen.findByText(/translation saved successfully/i)).toBeInTheDocument();
  });

  it('clears form after submission when no initial values', async () => {
    const user = userEvent.setup();
    renderWithToast(<TranslationForm onSubmit={mockOnSubmit} />);

    const mandarinInput = screen.getByLabelText(/mandarin/i);
    const englishInput = screen.getByLabelText(/english translation/i);

    await user.type(mandarinInput, '你好');
    await user.type(englishInput, 'Hello');
    await user.click(screen.getByRole('button', { name: /add translation/i }));

    await waitFor(() => {
      expect(mandarinInput).toHaveValue('');
      expect(englishInput).toHaveValue('');
    });
  });

  it('does not clear form when initial values are provided', async () => {
    const user = userEvent.setup();
    renderWithToast(
      <TranslationForm onSubmit={mockOnSubmit} initialMandarin="你好" initialEnglish="Hello" />
    );

    await user.click(screen.getByRole('button', { name: /add translation/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/mandarin/i)).toHaveValue('你好');
      expect(screen.getByLabelText(/english translation/i)).toHaveValue('Hello');
    });
  });
});
