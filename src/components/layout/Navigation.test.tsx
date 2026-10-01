import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Navigation } from './Navigation';
import { addTranslation } from '../../utils/translationService';

const renderNav = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navigation />
    </MemoryRouter>
  );

describe('Navigation', () => {
  it('shows the logo mark without adding it to the home link name', () => {
    renderNav();
    const home = screen.getByRole('link', { name: 'Phraser' });
    expect(home).toHaveAttribute('href', '/');
    expect(home).toHaveTextContent('語');
  });

  it('marks the current route with aria-current', () => {
    renderNav('/flashcards');
    expect(screen.getByRole('link', { name: 'Flashcards' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('hides the count badge when the deck is empty', () => {
    renderNav('/list');
    const link = screen.getByRole('link', { name: /all translations/i });
    expect(link.textContent).toBe('All Translations');
  });

  it('shows the count badge once there are translations', async () => {
    await addTranslation('你好', 'Hello');
    renderNav('/list');
    const link = screen.getByRole('link', { name: /all translations/i });
    expect(link.textContent).toContain('1');
  });

  it('is a labelled landmark', () => {
    renderNav();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  describe('mobile panel', () => {
    it('is closed initially and exposes that on the toggle', () => {
      renderNav();
      expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('opens, and points at the panel it controls', async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole('button', { name: /open menu/i }));

      const toggle = screen.getByRole('button', { name: /close menu/i });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const panelId = toggle.getAttribute('aria-controls');
      expect(document.getElementById(panelId!)).toBeInTheDocument();
    });

    it('closes on Escape and returns focus to the toggle', async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole('button', { name: /open menu/i }));
      const panel = document.getElementById(
        screen.getByRole('button', { name: /close menu/i }).getAttribute('aria-controls')!
      );
      (panel?.querySelector('a') as HTMLElement).focus();

      await user.keyboard('{Escape}');

      expect(screen.getByRole('button', { name: /open menu/i })).toHaveFocus();
    });

    it('closes when a link is chosen', async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole('button', { name: /open menu/i }));
      const panelLinks = screen.getAllByRole('link', { name: 'Settings' });
      await user.click(panelLinks[panelLinks.length - 1]!);

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('closes on an outside pointer press', async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole('button', { name: /open menu/i }));
      await user.click(document.body);

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });
  });
});
