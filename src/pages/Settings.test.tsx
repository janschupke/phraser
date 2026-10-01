import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastContext';
import Settings from './Settings';
import { addTranslation } from '../utils/translationService';
import { getSettings } from '../utils/settings';
import * as csvExport from '../utils/csvExport';

const renderPage = () =>
  render(
    <ToastProvider>
      <Settings />
    </ToastProvider>
  );

describe('Settings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('toggles', () => {
    it.each([
      ['Active Input Mode', 'activeInput', true],
      ['Reverse Mode', 'reverseMode', true],
      ['Color Coded Cards', 'colorCodedCards', false],
    ] as const)('persists %s', async (label, key, expected) => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByText(label));
      expect(getSettings()[key]).toBe(expected);
    });

    it('reflects the stored value on mount', () => {
      renderPage();
      // colorCodedCards defaults to on, the other two off.
      expect(screen.getByRole('checkbox', { name: /color coded cards/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /reverse mode/i })).not.toBeChecked();
    });
  });

  describe('export', () => {
    it('refuses with nothing to export', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /export csv/i }));
      expect(await screen.findByText(/no translations to export/i)).toBeInTheDocument();
    });

    it('exports and confirms', async () => {
      await addTranslation('你好', 'Hello');
      const download = vi.spyOn(csvExport, 'downloadTranslationsAsCSV').mockImplementation(() => {
        /* no-op */
      });
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /export csv/i }));
      expect(download).toHaveBeenCalled();
      expect(await screen.findByText(/exported 1 translation/i)).toBeInTheDocument();
    });

    it('reports a failed export', async () => {
      await addTranslation('你好', 'Hello');
      vi.spyOn(csvExport, 'downloadTranslationsAsCSV').mockImplementation(() => {
        throw new Error('nope');
      });
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /export csv/i }));
      expect(await screen.findByText(/failed to export/i)).toBeInTheDocument();
    });
  });

  describe('reset', () => {
    it('refuses with nothing to reset', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /reset all data/i }));
      expect(await screen.findByText(/no translations to reset/i)).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('asks for confirmation and can be cancelled', async () => {
      await addTranslation('你好', 'Hello');
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /reset all data/i }));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent(/delete all 1 translation/i);

      await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('clears everything once confirmed', async () => {
      await addTranslation('你好', 'Hello');
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /reset all data/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^reset all data$/i }));

      expect(await screen.findByText(/have been reset/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    });
  });
});
