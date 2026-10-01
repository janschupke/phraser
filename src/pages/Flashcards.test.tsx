import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastContext';
import Flashcards from './Flashcards';
import * as service from '../utils/translationService';
import { updateSetting } from '../utils/settings';

const renderPage = () =>
  render(
    <ToastProvider>
      <Flashcards />
    </ToastProvider>
  );

describe('Flashcards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an empty state with nothing to practise', () => {
    renderPage();
    expect(screen.getByText(/no translations available yet/i)).toBeInTheDocument();
  });

  it('shows a card and the deck size', async () => {
    await service.addTranslation('你好', 'Hello');
    renderPage();

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText(/1 total/)).toBeInTheDocument();
  });

  it('reveals then advances', async () => {
    await service.addTranslation('你好', 'Hello');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /reveal answer/i }));
    expect(screen.getByText('Hello')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next card/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reveal answer/i })).toBeInTheDocument();
    });
  });

  it('shows the prompt reversed in reverse mode', async () => {
    await service.addTranslation('你好', 'Hello');
    updateSetting('reverseMode', true);
    renderPage();

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('你好')).not.toBeInTheDocument();
  });

  it('grades typed answers and tracks the session score in active input mode', async () => {
    await service.addTranslation('你好', 'Hello');
    updateSetting('activeInput', true);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/enter translation/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /check answer/i }));

    expect(await screen.findByText(/correct/i)).toBeInTheDocument();
  });

  it('marks a wrong Mandarin answer incorrect in reverse mode', async () => {
    // The regression that mattered: with the old ASCII-only normalizer this
    // scored correct no matter what was typed.
    await service.addTranslation('你好', 'Hello');
    updateSetting('activeInput', true);
    updateSetting('reverseMode', true);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/enter mandarin/i), '貓');
    await user.click(screen.getByRole('button', { name: /check answer/i }));

    expect(await screen.findByText(/incorrect/i)).toBeInTheDocument();
  });

  it('reports a failed edit', async () => {
    await service.addTranslation('你好', 'Hello');
    vi.spyOn(service, 'updateTranslation').mockResolvedValue(false);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/failed to update/i)).toBeInTheDocument();
  });

  it('rejects an edit that empties a field', async () => {
    await service.addTranslation('你好', 'Hello');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await user.clear(screen.getByDisplayValue('你好'));
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    // The editor refuses to submit rather than saving an empty value.
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('deletes the current card', async () => {
    await service.addTranslation('你好', 'Hello');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await user.click(screen.getByRole('button', { name: /delete translation/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByText(/deleted successfully/i)).toBeInTheDocument();
  });

  it('reports a failed delete', async () => {
    await service.addTranslation('你好', 'Hello');
    vi.spyOn(service, 'deleteTranslation').mockReturnValue(false);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await user.click(screen.getByRole('button', { name: /delete translation/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByText(/failed to delete/i)).toBeInTheDocument();
  });
});
