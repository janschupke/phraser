import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContext';

function Trigger() {
  const { showToast } = useToast();
  return (
    <>
      <button type="button" onClick={() => showToast('success', 'Saved')}>
        ok
      </button>
      <button type="button" onClick={() => showToast('error', 'Broke')}>
        bad
      </button>
    </>
  );
}

const renderWithProvider = () =>
  render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );

describe('ToastContext', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when used outside a provider', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Trigger />)).toThrow(/must be used within a ToastProvider/);
    quiet.mockRestore();
  });

  it('shows a success toast politely, not assertively', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'ok' }));

    expect(screen.getByText('Saved')).toBeInTheDocument();
    // Only errors interrupt; a routine confirmation should not.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error toast assertively', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'bad' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Broke');
  });

  it('dismisses on demand', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'ok' }));
    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('auto-dismisses after five seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'ok' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('stacks several toasts', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'ok' }));
    await user.click(screen.getByRole('button', { name: 'bad' }));

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Broke')).toBeInTheDocument();
  });
});
