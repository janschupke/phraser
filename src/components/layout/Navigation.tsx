import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useTranslations } from '../../hooks/useStoredState';
import { useHotkeys } from '../../hooks/useHotkeys';
import { NavList } from './NavList';

export function Navigation() {
  const location = useLocation();
  const translationCount = useTranslations().length;
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // A disclosure, not a dialog: focus stays on the toggle and is not trapped.
  useHotkeys(
    {
      Escape: () => {
        // Only pull focus back if it is actually inside the panel; otherwise we
        // would yank it from wherever the user really is.
        const focusWasInside = panelRef.current?.contains(document.activeElement) ?? false;
        setIsOpen(false);
        if (focusWasInside) toggleRef.current?.focus();
      },
    },
    { enabled: isOpen }
  );

  // Close on navigation. The click handler on the links covers the case this
  // misses: clicking the already-active link does not change pathname.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeIfOutside = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    // pointerdown fires before focus moves; focusin catches keyboard users
    // tabbing past the panel.
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('focusin', closeIfOutside);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('focusin', closeIfOutside);
    };
  }, [isOpen]);

  return (
    <nav aria-label="Main" className="sticky top-0 z-40 bg-surface shadow-md shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-bold text-lg text-neutral-800 rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Phraser
          </Link>

          <NavList
            className="hidden md:flex md:items-center md:gap-2"
            translationCount={translationCount}
          />

          <button
            ref={toggleRef}
            type="button"
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen(open => !open)}
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>

          {/*
            Absolutely positioned so opening the menu overlays the page rather
            than pushing it down and shrinking the viewport-fit flashcard. Not
            rendered at all when closed -- CSS-hiding would leave the links in
            the tab order.
          */}
          {isOpen && (
            <div
              ref={panelRef}
              id={panelId}
              className="md:hidden absolute top-full inset-x-0 bg-surface shadow-lg rounded-b-lg"
            >
              <NavList
                className="flex flex-col gap-1 p-3"
                translationCount={translationCount}
                onNavigate={() => setIsOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
