import type { ReactElement } from 'react';
import AddTranslation from './pages/AddTranslation';
import Flashcards from './pages/Flashcards';
import ListTranslations from './pages/ListTranslations';
import Settings from './pages/Settings';

export interface RouteMeta {
  path: string;
  label: string;
  element: ReactElement;
  /** Show this route in the main navigation. */
  showInNav: boolean;
  /**
   * Size the page to the viewport instead of letting the document scroll.
   * Long content then scrolls inside the card rather than growing the page.
   */
  fitViewport: boolean;
}

/**
 * The single source of truth for routes. App renders these as <Route>s and
 * Navigation renders the nav ones, so the two can no longer drift -- previously
 * each kept its own list.
 */
export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    label: 'Add Translation',
    element: <AddTranslation />,
    showInNav: true,
    fitViewport: false,
  },
  {
    path: '/flashcards',
    label: 'Flashcards',
    element: <Flashcards />,
    showInNav: true,
    fitViewport: true,
  },
  {
    path: '/list',
    label: 'All Translations',
    element: <ListTranslations />,
    showInNav: true,
    fitViewport: false,
  },
  {
    path: '/settings',
    label: 'Settings',
    element: <Settings />,
    showInNav: true,
    fitViewport: false,
  },
];
