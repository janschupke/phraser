import { describe, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import AddTranslation from './pages/AddTranslation';
import Flashcards from './pages/Flashcards';
import ListTranslations from './pages/ListTranslations';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { BatchImportReview } from './components/features/BatchImportReview';
import { addTranslation } from './utils/translationService';
import { expectNoA11yViolations } from './test/axe';

/**
 * Accessibility violations live in states, not default renders, so these cover
 * each route plus the states that only appear after an interaction.
 *
 * See src/test/axe.ts for what jsdom can and cannot actually check.
 */
const renderRoute = (ui: React.ReactElement, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AppLayout>{ui}</AppLayout>
      </ToastProvider>
    </MemoryRouter>
  );

describe('accessibility', () => {
  beforeEach(async () => {
    await addTranslation('你好', 'Hello');
    await addTranslation('謝謝', 'Thank you');
  });

  it('Add Translation, single entry', async () => {
    const { container } = renderRoute(<AddTranslation />, '/');
    await expectNoA11yViolations(container);
  });

  it('Add Translation, batch import', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute(<AddTranslation />, '/');
    await user.click(screen.getByRole('button', { name: /batch import/i }));
    await expectNoA11yViolations(container);
  });

  it('Batch import review', async () => {
    const { container } = render(
      <ToastProvider>
        <BatchImportReview
          entries={[{ mandarin: '你好', translation: 'Hello' }]}
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      </ToastProvider>
    );
    await expectNoA11yViolations(container);
  });

  it('Flashcards', async () => {
    const { container } = renderRoute(<Flashcards />, '/flashcards');
    await expectNoA11yViolations(container);
  });

  it('Flashcards, answer revealed', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute(<Flashcards />, '/flashcards');
    await user.click(screen.getByRole('button', { name: /reveal answer/i }));
    await expectNoA11yViolations(container);
  });

  it('Flashcards, edit mode', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute(<Flashcards />, '/flashcards');
    await user.click(screen.getByRole('button', { name: /edit flashcard/i }));
    await expectNoA11yViolations(container);
  });

  it('All Translations', async () => {
    const { container } = renderRoute(<ListTranslations />, '/list');
    await expectNoA11yViolations(container);
  });

  it('All Translations, row expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute(<ListTranslations />, '/list');
    const disclosure = screen
      .getAllByRole('button')
      .find(button => button.hasAttribute('aria-expanded'));
    if (disclosure) await user.click(disclosure);
    await expectNoA11yViolations(container);
  });

  it('All Translations, delete dialog open', async () => {
    const user = userEvent.setup();
    renderRoute(<ListTranslations />, '/list');
    await user.click(screen.getAllByRole('button', { name: /^delete /i })[0]!);
    await expectNoA11yViolations(screen.getByRole('dialog'));
  });

  it('Settings', async () => {
    const { container } = renderRoute(<Settings />, '/settings');
    await expectNoA11yViolations(container);
  });

  it('Not found', async () => {
    const { container } = renderRoute(<NotFound />, '/nope');
    await expectNoA11yViolations(container);
  });
});
