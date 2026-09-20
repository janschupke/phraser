import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

const at = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App routing', () => {
  it.each([
    ['/', 'Add Translation'],
    ['/flashcards', 'Flashcards'],
    ['/list', 'All Translations'],
    ['/settings', 'Settings'],
  ])('renders %s', (path, heading) => {
    at(path);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('renders a not-found page for an unknown path', () => {
    at('/nope');
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
  });

  it('offers a skip link as the first focusable element', () => {
    at('/');
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });
});
