import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ToastProvider } from '../contexts/ToastContext';
import ListTranslations from './ListTranslations';
import * as service from '../utils/translationService';
import type { Translation } from '../types';
import { at } from '../test/helpers';

vi.mock('../utils/translationService');

const mockTranslations: Translation[] = [
  { id: '1', mandarin: '你好', translation: 'Hello', pinyin: 'ní hǎo' },
  { id: '2', mandarin: '谢谢', translation: 'Thank you', pinyin: 'xiè xie' },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ListTranslations />
      </ToastProvider>
    </MemoryRouter>
  );

const disclosures = () =>
  screen.getAllByRole('button').filter(button => button.hasAttribute('aria-expanded'));

describe('ListTranslations', () => {
  beforeEach(() => {
    vi.mocked(service.getTranslations).mockReturnValue(mockTranslations);
    vi.mocked(service.updateTranslation).mockResolvedValue(true);
    vi.mocked(service.deleteTranslation).mockReturnValue(true);
  });

  it('lists every translation, collapsed', () => {
    renderPage();

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('谢谢')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('Thank you')).not.toBeInTheDocument();
  });

  it('expands a row on demand', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(at(disclosures(), 0));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows the empty state when there is nothing saved', () => {
    vi.mocked(service.getTranslations).mockReturnValue([]);
    renderPage();
    expect(screen.getByText(/no translations saved yet/i)).toBeInTheDocument();
  });

  describe('long lists', () => {
    const many: Translation[] = Array.from({ length: 250 }, (_, i) => ({
      id: String(i),
      mandarin: `词${i}`,
      translation: `word ${i}`,
    }));

    beforeEach(() => {
      vi.mocked(service.getTranslations).mockReturnValue(many);
    });

    it('mounts the first 100 rows and offers the rest', () => {
      renderPage();
      expect(disclosures()).toHaveLength(100);
      expect(screen.getByRole('button', { name: 'Show more (150 remaining)' })).toBeInTheDocument();
      expect(screen.getByText('250 translations')).toBeInTheDocument();
    });

    it('loads a page at a time, moving focus to the first new row', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /show more/i }));
      expect(disclosures()).toHaveLength(200);
      expect(at(disclosures(), 100)).toHaveFocus();

      await user.click(screen.getByRole('button', { name: 'Show more (50 remaining)' }));
      expect(disclosures()).toHaveLength(250);
      expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
      // The button is gone; focus went to row 201 rather than to <body>.
      expect(at(disclosures(), 200)).toHaveFocus();
    });

    it('searches every translation, not only the mounted ones', async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByText('词240')).not.toBeInTheDocument();

      await user.type(screen.getByLabelText(/search translations/i), 'word 240');

      expect(screen.getByText('词240')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 250')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
    });

    it('starts over at one page when the search changes', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: /show more/i }));
      expect(disclosures()).toHaveLength(200);

      // Well over one page of matches, so the reset is observable.
      await user.type(screen.getByLabelText(/search translations/i), 'word');
      expect(disclosures()).toHaveLength(100);
      expect(screen.getByRole('button', { name: 'Show more (150 remaining)' })).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters by english translation', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), 'thank');

      expect(screen.getByText('谢谢')).toBeInTheDocument();
      expect(screen.queryByText('你好')).not.toBeInTheDocument();
    });

    it('filters by pinyin without tone marks', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), 'ni hao');

      expect(screen.getByText('你好')).toBeInTheDocument();
      expect(screen.queryByText('谢谢')).not.toBeInTheDocument();
    });

    it('filters by Han characters', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), '谢');

      expect(screen.getByText('谢谢')).toBeInTheDocument();
      expect(screen.queryByText('你好')).not.toBeInTheDocument();
    });

    it('reports the result count in a live region', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), 'thank');
      // Scoped by text: the toast container is also a status region.
      const count = screen.getByText('Showing 1 of 2');
      expect(count).toHaveAttribute('aria-live', 'polite');
    });

    it('distinguishes no-matches from no-data, and clears', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), 'zzz');
      expect(screen.getByText(/no translations match/i)).toBeInTheDocument();
      expect(screen.queryByText(/no translations saved yet/i)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    it('shows the translation on collapsed rows while searching', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/search translations/i), 'thank');
      expect(screen.getByText('Thank you')).toBeInTheDocument();
    });
  });

  it('edits a translation', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit 你好/i }));
    const field = screen.getByDisplayValue('你好');
    await user.clear(field);
    await user.type(field, '您好');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(service.updateTranslation).toHaveBeenCalledWith('1', '您好', 'Hello');
    });
  });

  it('cancels an edit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /edit 你好/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.queryByDisplayValue('你好')).not.toBeInTheDocument();
  });

  it('deletes a translation after confirming', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /delete 你好/i }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(service.deleteTranslation).toHaveBeenCalledWith('1');
    });
  });
});
